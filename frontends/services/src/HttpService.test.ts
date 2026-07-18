import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import axios from 'axios';
import HttpService from './HttpService';

vi.mock('axios', () => {
  const axiosFn = Object.assign(vi.fn().mockResolvedValue({ data: {} }), {
    defaults: { withCredentials: false },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  });
  return { default: axiosFn };
});

const mockedAxios = vi.mocked(axios);

describe('HttpService', () => {
  describe('injectParamsToPath', () => {
    it('replaces single parameter in path', () => {
      const result = HttpService.injectParamsToPath(
        { userId: '123' },
        '/users/:userId'
      );
      expect(result).toBe('/users/123');
    });

    it('replaces multiple parameters in path', () => {
      const result = HttpService.injectParamsToPath(
        { companyId: 'abc', userId: '123' },
        '/companies/:companyId/users/:userId'
      );
      expect(result).toBe('/companies/abc/users/123');
    });

    it('handles empty params object', () => {
      const result = HttpService.injectParamsToPath({}, '/users/:userId');
      expect(result).toBe('/users/:userId');
    });

    it('handles undefined params', () => {
      const result = HttpService.injectParamsToPath(undefined, '/users/:userId');
      expect(result).toBe('/users/:userId');
    });

    it('handles path with no parameters', () => {
      const result = HttpService.injectParamsToPath(
        { userId: '123' },
        '/users/list'
      );
      expect(result).toBe('/users/list');
    });

    it('handles numeric parameter values', () => {
      const result = HttpService.injectParamsToPath(
        { page: 1, limit: 10 },
        '/items?page=:page&limit=:limit'
      );
      expect(result).toBe('/items?page=1&limit=10');
    });

    it('replaces only matching parameters', () => {
      const result = HttpService.injectParamsToPath(
        { userId: '123' },
        '/companies/:companyId/users/:userId'
      );
      expect(result).toBe('/companies/:companyId/users/123');
    });
  });

  describe('isLogoutRoute', () => {
    it('returns true for logout route', () => {
      expect(HttpService.isLogoutRoute('/auth/logout')).toBe(true);
    });

    it('returns true for logout route with base URL', () => {
      expect(HttpService.isLogoutRoute('https://api.example.com/auth/logout')).toBe(true);
    });

    it('returns true for logout route with query params', () => {
      expect(HttpService.isLogoutRoute('/auth/logout?redirect=/')).toBe(true);
    });

    it('returns false for login route', () => {
      expect(HttpService.isLogoutRoute('/auth/login')).toBe(false);
    });

    it('returns false for other routes', () => {
      expect(HttpService.isLogoutRoute('/users/123')).toBe(false);
      expect(HttpService.isLogoutRoute('/api/data')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(HttpService.isLogoutRoute('')).toBe(false);
    });

    it('returns false for partial match (logout in different context)', () => {
      expect(HttpService.isLogoutRoute('/users/logout-history')).toBe(false);
    });
  });

  describe('request timeouts', () => {
    beforeAll(() => {
      HttpService.setup({
        baseApiUrl: 'https://api.example.com',
        on500ErrorNotification: () => {},
      });
    });

    beforeEach(() => {
      mockedAxios.mockClear();
      mockedAxios.mockResolvedValue({ data: {} });
    });

    const lastAxiosConfig = () =>
      mockedAxios.mock.calls[mockedAxios.mock.calls.length - 1][0] as {
        timeout?: number;
      };

    it('leaves requests unbounded when no timeout is injected (long AI calls must not be cut off)', async () => {
      await HttpService.sendRequest({ method: 'get', path: '/health' });

      expect(lastAxiosConfig().timeout).toBe(HttpService.NO_REQUEST_TIMEOUT_MS);
    });

    it('leaves multipart uploads unbounded when no timeout is injected', async () => {
      await HttpService.sendRequest({
        method: 'post',
        path: '/upload',
        multipart: true,
        body: { note: 'hello' },
      });

      expect(lastAxiosConfig().timeout).toBe(HttpService.NO_REQUEST_TIMEOUT_MS);
    });

    it('honours a per-request timeout override, including for multipart', async () => {
      await HttpService.sendRequest({
        method: 'post',
        path: '/upload',
        multipart: true,
        body: {},
        timeoutMs: 5000,
      });

      expect(lastAxiosConfig().timeout).toBe(5000);
    });

    it('bounds plain requests when an offline-first app injects a timeout', async () => {
      HttpService.setup({
        baseApiUrl: 'https://api.example.com',
        on500ErrorNotification: () => {},
        requestTimeoutMs: 30000,
      });

      await HttpService.sendRequest({ method: 'get', path: '/health' });
      expect(lastAxiosConfig().timeout).toBe(30000);

      // Restore the unbounded default for other tests
      HttpService.setup({
        baseApiUrl: 'https://api.example.com',
        on500ErrorNotification: () => {},
      });
    });

    it('gives multipart uploads the longer upload budget when a timeout is injected', async () => {
      HttpService.setup({
        baseApiUrl: 'https://api.example.com',
        on500ErrorNotification: () => {},
        requestTimeoutMs: 15000,
      });

      await HttpService.sendRequest({
        method: 'post',
        path: '/upload',
        multipart: true,
        body: { note: 'hello' },
      });
      expect(lastAxiosConfig().timeout).toBe(HttpService.MULTIPART_REQUEST_TIMEOUT_MS);

      // Restore the unbounded default for other tests
      HttpService.setup({
        baseApiUrl: 'https://api.example.com',
        on500ErrorNotification: () => {},
      });
    });

    it('propagates timeout errors to the caller (offline fallbacks depend on the rejection)', async () => {
      const timeoutError = Object.assign(new Error('timeout of 15000ms exceeded'), {
        code: 'ECONNABORTED',
      });
      mockedAxios.mockRejectedValueOnce(timeoutError);

      await expect(
        HttpService.sendRequest({ method: 'get', path: '/health' }),
      ).rejects.toMatchObject({ code: 'ECONNABORTED' });
    });
  });
});
