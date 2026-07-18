import { ProcEnvHelper } from 'proc-env-helper';
import dotenv from 'dotenv';

dotenv.config();

export default {
  env: ProcEnvHelper.getOrSetDefault('NODE_ENV', 'production'),
  port: ProcEnvHelper.getOrSetDefault('PORT', 8080),

  socket: {
    path: ProcEnvHelper.getOrSetDefault('SOCKET_IO_PATH', '/socket/socket-io'),
    corsOrigin: ProcEnvHelper.getOrSetDefault('SOCKET_IO_CORS_ORIGIN', '*'),
  },

  // MongoDB (shared database with api-mono for session validation)
  mongoDb: {
    mongoAdditionalParams: ProcEnvHelper.getOrSetDefault(
      'MONGO_ADDITIONAL_PARAMS',
      'retryWrites=true&w=majority',
    ),
    mongoDatabase: ProcEnvHelper.getOrSetDefault('MONGO_DB', 'api-mono'),
    mongoHost: ProcEnvHelper.getOrSetDefault('MONGO_HOST', 'changeme'),
    mongoPassword: ProcEnvHelper.getOrSetDefault('MONGO_PW', 'changeme'),
    mongoUser: ProcEnvHelper.getOrSetDefault('MONGO_USER', 'changeme'),
    mongoPort: ProcEnvHelper.getOrSetDefault('MONGO_PORT', false),
    mongoProtocol: ProcEnvHelper.getOrSetDefault('MONGO_PROTOCOL', 'mongodb+srv'),
    mongoUri: ProcEnvHelper.getOrSetDefault('MONGO_URI', false),
    // A socket pod only validates a session at handshake, so it needs very few
    // connections. Mongoose defaults to maxPoolSize 100 per instance; capping
    // at 10 bounds deploy-overlap spikes against the shared Atlas M20 cluster's
    // 3000-connection limit. 10 is ample for handshake-time session lookups.
    mongoOpts: {
      maxPoolSize: Number(ProcEnvHelper.getOrSetDefault('MONGO_MAX_POOL_SIZE', 10)),
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10_000,
    },
  },

  // Dev auto-seed (bypass authentication in local development)
  devAutoSeed: {
    enabled: ProcEnvHelper.getOrSetDefault('DEV_AUTO_SEED', false),
    user: {
      email: ProcEnvHelper.getOrSetDefault('DEV_USER_EMAIL', 'dev@temp-local-only.invalid'),
      name: ProcEnvHelper.getOrSetDefault('DEV_USER_NAME', 'Joe Dev User'),
    },
  },

  // Each pod creates its own ephemeral subscription on the shared topic at
  // boot so PubSub fans every message out to every pod. A shared
  // subscription would load-balance and cause clients connected to other
  // pods to miss events.
  socketPubSub: {
    enabled: ProcEnvHelper.getOrSetDefault('SOCKET_PUBSUB_ENABLED', true),
    projectId: ProcEnvHelper.getOrSetDefault('SOCKET_PUBSUB_PROJECT_ID', ''),
    emulatorHost: ProcEnvHelper.getOrSetDefault('PUBSUB_EMULATOR_HOST', ''),
    topicName: ProcEnvHelper.getOrSetDefault('SOCKET_PUBSUB_TOPIC', 'socket-events'),
    createTopicIfMissing: ProcEnvHelper.getOrSetDefault(
      'SOCKET_PUBSUB_CREATE_TOPIC_IF_MISSING',
      false,
    ),
    // Dead pods leak subscriptions; GCP auto-deletes after this many
    // seconds of subscriber inactivity.
    subscriptionExpirationSeconds: Number(
      ProcEnvHelper.getOrSetDefault('SOCKET_PUBSUB_SUBSCRIPTION_EXPIRATION_SECONDS', 86_400),
    ),
  },
};
