# api-sockets

Dedicated Socket.IO gateway service that handles real-time WebSocket connections, isolated from the main API for independent scaling.

**This service is fully stateless** - it has no database and makes no REST calls to other services. Authentication is handled entirely via IAP/IDP JWT validation.

## Architecture

```
┌─────────────┐     REST      ┌─────────────┐     PubSub      ┌──────────────┐
│   Client    │ ────────────► │  api-mono   │ ──────────────► │ Google Cloud │
│  (Browser)  │               │   (API)     │                 │   PubSub     │
└─────────────┘               └─────────────┘                 └──────────────┘
       │                                                             │
       │ WebSocket                                                   │ Subscribe
       │                                                             ▼
       │                                                      ┌──────────────┐
       └─────────────────────────────────────────────────────►│ api-sockets  │
                                                              │  (Socket.IO) │
                                                              └──────────────┘
```

### Flow

1. **Client connects** via WebSocket to `api-sockets` (authenticated via IAP/IDP JWT header)
2. **Client joins room** based on their `externalId` (extracted from IAP/IDP JWT `sub` claim)
3. **API triggers event** (e.g., AppData created) and looks up target users' `externalId` values from MongoDB
4. **API publishes** message to PubSub with `externalIds` containing `externalId` values
5. **api-sockets subscribes** to PubSub topic and receives the message
6. **api-sockets emits** to rooms matching those `externalId` values via Socket.IO

### Key Design Decisions

- **No database**: api-sockets doesn't need MongoDB - the IAP/IDP `sub` claim is used directly as the room identifier
- **No REST calls**: api-sockets doesn't call api-mono - user identity comes from the validated JWT
- **externalId matching**: api-mono stores `externalId` (IAP/IDP `sub` claim) on users and uses it for socket targeting
- **Multi-provider support**: Works with Google IAP, Azure AD, or email/password via Google Identity Platform

### Benefits

- **Fully stateless**: No database, no service dependencies - perfect for serverless/Cloud Run
- **Independent scaling**: Socket connections scale separately from API pods
- **Blast radius isolation**: Socket service issues don't affect API availability
- **Cloud Run compatible**: Can scale independently; no internal DNS required

## Local Development

The service runs as part of docker-compose:

```bash
docker-compose -f docker-compose.dev.yml up
```

Services:
- **pubsub-emulator**: Google PubSub emulator on port 8085
- **api-sockets**: Socket.IO server on port 8081 (proxied via nginx at `/socket.io/`)
- **api-mono**: Main API that publishes to PubSub

## Configuration

See `.env.example` for all configuration options.

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8081` |
| `SOCKET_IO_PATH` | Socket.IO path | `/socket.io` |
| `IAP_ENABLED` | Enable IAP JWT validation | `true` |
| `IAP_DEV_AUTO_SEED` | Auto-create dev user (when IAP disabled) | `false` |
| `PUBSUB_EMULATOR_HOST` | PubSub emulator host (local dev only) | - |
| `SOCKET_PUBSUB_TOPIC` | PubSub topic name (each pod creates its own ephemeral subscription on it) | `socket-events` |
| `SOCKET_PUBSUB_SUBSCRIPTION_EXPIRATION_SECONDS` | TTL for the per-pod subscription if the pod stops pulling | `86400` |

## Authentication

In production, clients connect through Google Cloud IAP or Identity Platform. The JWT is passed in the `x-goog-iap-jwt-assertion` header during the WebSocket handshake.

The service:
1. Validates the IAP/IDP JWT using Google's public keys
2. Extracts the user's `sub` claim (e.g., `accounts.google.com:123456789`)
3. Joins the socket to a room named after the `sub` claim (which matches `externalId` in MongoDB)

For local development with `IAP_DEV_AUTO_SEED=true`, a mock IAP user is created automatically.

## Message Format

Messages published to PubSub should follow this format:

```typescript
interface SocketPubSubMessage {
  event: string;        // Socket.IO event name (e.g., 'app_message')
  externalIds: string[]; // List of externalId values (IAP/IDP sub claims) to emit to
  payload: unknown;     // Event payload
  source: string;       // Source service (e.g., 'api-mono')
  publishedAt: string;  // ISO timestamp
}
```

**Important**: `externalIds` must contain `externalId` values (IAP/IDP `sub` claims), not MongoDB `_id` values.

## Scripts

```bash
npm run dev:start   # Start dev server with hot reload
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
```
