import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, Method, } from 'axios';
import AuthService from './AuthService';

export interface RequestObject {
  method: string;
  path: string;
  formData?: object;
  /** When true, `body` is sent as multipart/form-data (e.g. file uploads). */
  multipart?: boolean;
  params?: object;
  qs?: object;
  body?: object;
  headers?: object;
  baseUrl?: string;
  /** Per-request timeout override in ms (rarely needed — see class defaults). */
  timeoutMs?: number;
}

export default class HttpService {
  // By default requests are NOT time-bound (axios timeout 0 = wait forever) —
  // some legitimately run long. Offline-first apps can inject a timeout via
  // setup({ requestTimeoutMs }) so a dead connection fails over to their
  // offline caches instead of hanging on a spinner. When a timeout regime is
  // injected, multipart uploads get a longer budget because large bodies
  // (audio, images) are legitimately slow on weak links.
  static readonly NO_REQUEST_TIMEOUT_MS = 0;
  static readonly MULTIPART_REQUEST_TIMEOUT_MS = 120000;

  private static httpClassSetup = false;
  private static baseApiUrl: string = '';
  private static requestTimeoutMs: number = HttpService.NO_REQUEST_TIMEOUT_MS;
  private static on500ErrorNotification: () => void;
  private static on401ErrorNotification?: () => void;

  static setup (input: {
    baseApiUrl: string,
    on500ErrorNotification: () => void,
    on401ErrorNotification?: () => void,
    /** Time-bound non-multipart requests (offline-first apps only). */
    requestTimeoutMs?: number
  }) {
    HttpService.baseApiUrl = input.baseApiUrl;
    HttpService.setupAxiosInterceptors();
    HttpService.on500ErrorNotification = input.on500ErrorNotification;
    HttpService.on401ErrorNotification = input.on401ErrorNotification;
    HttpService.requestTimeoutMs = input.requestTimeoutMs ?? HttpService.NO_REQUEST_TIMEOUT_MS;
    HttpService.httpClassSetup = true;
    AuthService.setup({
      onLogout: input.on401ErrorNotification,
    });
  }

  static async sendRequest (requestObject: RequestObject): Promise<any> {
    if (!HttpService.httpClassSetup) {
      throw new Error('You must call HttpService.setup beforehand');
    }

    const baseUrl = requestObject.baseUrl || HttpService.baseApiUrl;
    const path = HttpService.injectParamsToPath(requestObject.params, requestObject.path);
    // If baseUrl is empty/undefined, use path as-is (absolute from domain root)
    const URL = baseUrl ? baseUrl + path : path;

    // multipart/form-data uploads (e.g. audio transcription). The generated
    // consumers flag these with `multipart: true` and pass the fields (incl. a
    // Blob/File) as `body`. We send a real FormData and let the browser/axios
    // set the multipart Content-Type + boundary — do not set it manually.
    const data = requestObject.multipart
      ? HttpService.buildFormData((requestObject.body as Record<string, any>) || {})
      : requestObject.body || {};

    const axiosReq: AxiosRequestConfig = {
      headers: {
        ...requestObject.headers,
      },
      method: requestObject.method as Method,
      data,
      params: requestObject.qs || {},
      url: URL,
      withCredentials: true,
      timeout: requestObject.timeoutMs
        ?? (requestObject.multipart && HttpService.requestTimeoutMs > 0
          ? HttpService.MULTIPART_REQUEST_TIMEOUT_MS
          : HttpService.requestTimeoutMs),
    };

    return axios(axiosReq)
      .then((response: AxiosResponse) => response.data)
      .catch((err: AxiosError) => {
        throw err;
      });
  }

  static isLogoutRoute (url: string): boolean {
    return /\/auth\/logout/.test(url);
  }

  /**
   * Convert a plain object into a FormData instance. Blob/File values are
   * appended as files (preserving the filename for File); everything else is
   * stringified. null/undefined values are skipped.
   */
  static buildFormData (source: Record<string, any>): FormData {
    const formData = new FormData();
    Object.entries(source).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (value instanceof Blob) {
        const fileName = value instanceof File ? value.name : undefined;
        formData.append(key, value, fileName);
      } else {
        formData.append(key, String(value));
      }
    });
    return formData;
  }

  static injectParamsToPath (params: Record<any, any> = {}, path: string) {
    Object.keys(params).forEach((param) => {
      path = path.replace(':' + param, params[param]);
    });
    return path;
  }

  static setupAxiosInterceptors () {
    axios.defaults.withCredentials = true;

    axios.interceptors.request.use(
      HttpService.preRequestCheck.bind(this),
      (e) => Promise.reject(e)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          return HttpService.handle401(error);
        } else if (error.response?.status === 500) {
          return HttpService.handle500(error);
        }
        return Promise.reject(error);
      }
    );
  }

  static async preRequestCheck (
    axiosConfig: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> {
    axiosConfig.withCredentials = true;
    return axiosConfig;
  }

  static async handle401 (err: any) {
    if (
      err.response?.status === 401 &&
      !HttpService.isLogoutRoute(err.request?.responseURL || '')
    ) {
      console.warn('Session expired or invalid - logging out');
      if (HttpService.on401ErrorNotification) {
        HttpService.on401ErrorNotification();
      }
      await AuthService.logout(HttpService.baseApiUrl);
    }
    return Promise.reject(err);
  }

  static async logout (): Promise<void> {
    await AuthService.logout(HttpService.baseApiUrl);
  }

  static handle500 (err: any) {
    if (err.response?.status === 500) {
      HttpService.on500ErrorNotification();
      console.error(err);
    }
    return Promise.reject(err);
  }
}
