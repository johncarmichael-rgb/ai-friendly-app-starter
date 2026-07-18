import loadMongoose from 'load-mongoose';
import config from '@/config';

/**
 * Connect to MongoDB using the same load-mongoose package as api-mono.
 * Shares the same database so we can validate sessions on WebSocket handshake.
 */
export async function connectMongo(): Promise<void> {
  await loadMongoose(config.mongoDb);
  console.log('[api-sockets] MongoDB connected to: ' + config.mongoDb.mongoHost);
}
