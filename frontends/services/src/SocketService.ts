import { io, Socket } from 'socket.io-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketEventHandler = (data: any) => void;

/**
 * Host-supplied configuration for the socket service.
 */
export interface SocketServiceConfig {
  /** Socket.IO path the server is mounted on. */
  path: string;
  /** Base URL to dial. Defaults to `window.location.origin`. */
  baseUrl?: string;
  /** When true, `connect()` returns immediately without dialing. */
  isDemoMode?: boolean;
}

/**
 * SocketService
 *
 * Manages the WebSocket connection used for real-time server→client messages.
 *
 * Lives in the shared services package so any frontend app can use it. Host
 * calls `configure()` once at startup with the path/baseUrl before any
 * `connect()` call.
 *
 * @example
 *   SocketService.configure({ path: '/socket/socket-io', isDemoMode: false });
 *   await SocketService.connect();
 *   SocketService.on('my_event', (data) => console.log(data));
 *   SocketService.disconnect(); // on logout
 */
class SocketService {
  private static socket: Socket | null = null;
  private static isConnected = false;
  private static isConnecting = false;
  private static eventHandlers: Map<string, Set<SocketEventHandler>> = new Map();
  private static config: SocketServiceConfig | null = null;

  /**
   * Provide socket transport configuration. Must be called before `connect()`.
   * Safe to call multiple times — last call wins.
   */
  static configure(config: SocketServiceConfig): void {
    this.config = config;
  }

  /**
   * Connect to the WebSocket server.
   * Should be called after user authentication is complete.
   * The server will authenticate via the IAP JWT header passed during handshake.
   */
  static connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        reject(new Error('[Socket] configure() must be called before connect()'));
        return;
      }

      if (this.config.isDemoMode) {
        console.log('[Socket] Demo mode - skipping socket connection');
        resolve();
        return;
      }

      if (this.isConnected || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      const socketUrl = this.config.baseUrl || window.location.origin;

      console.log('[Socket] Connecting to:', socketUrl);

      this.socket = io(socketUrl, {
        path: this.config.path,
        withCredentials: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('authenticated', (data: { externalId: string; email: string }) => {
        console.log('[Socket] Authenticated');
        this.isConnected = true;
        this.isConnecting = false;
        this.notifyHandlers('authenticated', data);
        resolve();
      });

      this.socket.on('authentication_error', (data: { message: string }) => {
        console.error('[Socket] Authentication failed:', data.message);
        this.isConnecting = false;
        this.notifyHandlers('authentication_error', data);
        reject(new Error(data.message));
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('[Socket] Connection error:', error.message);
        this.isConnecting = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('[Socket] Disconnected:', reason);
        this.isConnected = false;
        this.notifyHandlers('disconnected', { reason });
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected, socket id:', this.socket?.id);
      });
    });
  }

  /**
   * Disconnect from the WebSocket server.
   * Should be called on logout.
   */
  static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isConnecting = false;
      console.log('[Socket] Disconnected');
    }
  }

  static get connected(): boolean {
    return this.isConnected;
  }

  static on(event: string, handler: SocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    if (this.socket && !['authenticated', 'authentication_error', 'disconnected'].includes(event)) {
      this.socket.on(event, handler);
    }
  }

  static off(event: string, handler: SocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }

    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static notifyHandlers(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[Socket] Error in handler for ${event}:`, error);
        }
      });
    }
  }
}

export default SocketService;
