import 'source-map-support/register';
import http from 'http';
import express from 'express';
import config from '@/config';
import { WebSocketHandler } from '@/services/WebSocketHandler';
import PubSubSubscriber from '@/services/PubSubSubscriber';
import { connectMongo } from '@/services/MongoConnection';

const app = express();

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-sockets' });
});

const server = http.createServer(app);

async function start() {
  // Attach Socket.IO before we start listening. This is synchronous and has
  // no DB dependency — socket auth validates sessions at handshake time, and
  // mongoose buffers those queries until the connection below is established.
  WebSocketHandler.init(server);

  // Open the port FIRST so Cloud Run's startup probe succeeds immediately.
  // Mongo + PubSub init happen in the background afterwards. Blocking the
  // listen on a slow DB connect (e.g. during peak-traffic deploys) is what
  // caused "container failed to start and listen on PORT" deploy failures.
  const PORT = config.port;
  server.listen(PORT, () => {
    console.log(`[api-sockets] Server listening on port: ${PORT}`);
  });

  // Connect to MongoDB (shared database with api-mono for session validation),
  // retrying so transient connection-pool saturation during a deploy doesn't
  // leave the pod permanently degraded.
  await connectWithRetry();

  // Initialize PubSub subscriber
  await PubSubSubscriber.init();
  console.log('[api-sockets] PubSub subscriber initialized');
}

async function connectWithRetry(attempt = 1): Promise<void> {
  const MAX_ATTEMPTS = 10;
  try {
    await connectMongo();
  } catch (error) {
    if (attempt >= MAX_ATTEMPTS) {
      throw error;
    }
    const delayMs = Math.min(1000 * 2 ** (attempt - 1), 30_000);
    console.error(
      `[api-sockets] MongoDB connect failed (attempt ${attempt}/${MAX_ATTEMPTS}), ` +
        `retrying in ${delayMs}ms:`,
      error,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return connectWithRetry(attempt + 1);
  }
}

start().catch((error) => {
  console.error('[api-sockets] Failed to start:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[api-sockets] SIGTERM received, shutting down...');
  await PubSubSubscriber.close();
  server.close(() => {
    console.log('[api-sockets] Server closed');
    process.exit(0);
  });
});
