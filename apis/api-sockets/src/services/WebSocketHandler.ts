import { Server, Socket } from 'socket.io';
import httpServer from 'http';
// cookie@1.x exports only named members (parse, serialize) — no default export.
import { parse as parseCookie } from 'cookie';
import config from '@/config';
import { findValidSession, SessionUser } from '@/services/SessionLookup';

const SESSION_COOKIE_NAME = 'sessionId';

export class WebSocketHandler {
  static io: Server;

  static init(httpServer: httpServer.Server) {
    WebSocketHandler.io = new Server(httpServer, {
      cors: { origin: config.socket.corsOrigin },
      path: config.socket.path,
    });
    WebSocketHandler.setupConnectionHandler();
    console.log(`[api-sockets] Socket.IO server initialized on path: ${config.socket.path}`);
  }

  static setupConnectionHandler() {
    WebSocketHandler.io.on('connection', async (socket: Socket) => {
      console.log('[api-sockets] New socket connection attempt:', socket.id);

      try {
        const sessionUser = await WebSocketHandler.authenticateSocket(socket);

        // Store user data on socket for later use
        socket.data.email = sessionUser.email;
        socket.data.userId = sessionUser.userId;

        // Join the user to a room keyed by email
        // This ensures all devices for the same user share one room
        await socket.join(sessionUser.email);

        socket.emit('authenticated', { email: sessionUser.email });
        console.log(`[api-sockets] Client authenticated and joined room: ${sessionUser.email}`);
      } catch (error) {
        console.error('[api-sockets] Socket authentication failed:', error);
        socket.emit('authentication_error', { message: 'Authentication failed' });
        socket.disconnect(true);
      }
    });
  }

  /**
   * Emit to a specific user's room (keyed by email)
   */
  static emitToUser(email: string, event: string, data: any) {
    try {
      this.io.to(email).emit(event, data);
    } catch (error) {
      console.error('[api-sockets] Error emitting to user:', error);
    }
  }

  /**
   * Authenticate the socket. Prefers a real WorkOS session cookie when one
   * is present — even in dev — so a logged-in user always joins the room
   * keyed by their actual email. Only falls back to the dev-seed user when
   * there's no usable session AND DEV_AUTO_SEED is enabled (covers the
   * unauthenticated local-poke case).
   *
   * Previously this short-circuited to the seed user whenever DEV_AUTO_SEED
   * was on, which caused real-user events (emitted by api-mono against the
   * logged-in email) to land in a room nobody was listening on.
   */
  private static async authenticateSocket(socket: Socket): Promise<SessionUser> {
    const sessionUser = await this.tryRealSession(socket);
    if (sessionUser) {
      return sessionUser;
    }

    if (config.devAutoSeed.enabled) {
      return {
        sessionId: 'dev-session',
        userId: 'dev-user',
        email: String(config.devAutoSeed.user.email),
        userRoles: [],
      };
    }

    throw new Error('No valid session on WebSocket handshake');
  }

  private static async tryRealSession(socket: Socket): Promise<SessionUser | null> {
    const rawCookies = socket.handshake.headers.cookie;
    if (!rawCookies) {
      return null;
    }
    const cookies = parseCookie(rawCookies);
    const sessionId = cookies[SESSION_COOKIE_NAME];
    if (!sessionId) {
      return null;
    }
    return findValidSession(sessionId);
  }
}
