import dotenv from 'dotenv';
import { Config } from 'load-mongoose';
import { ProcEnvHelper } from 'proc-env-helper';
import packageJson from '../package.json';
import { EmailerSendTypes } from 'nunjucks-emailer';
import { AppMiddlewareOptions } from '@/http/nodegen/middleware';

dotenv.config();

const gcpProjectId = String(ProcEnvHelper.getOrSetDefault('GCP_PROJECT_ID', ''));
const pubSubEmulatorHost = String(ProcEnvHelper.getOrSetDefault('PUBSUB_EMULATOR_HOST', ''));
// Without a projectId (and no emulator), the @google-cloud/pubsub client
// throws "we cannot connect to Cloud Services without a project ID" on its
// first call. On localhost we want to skip PubSub entirely instead of
// crashing, so default `enabled` off when neither is configured.
const pubSubAvailable = Boolean(gcpProjectId) || Boolean(pubSubEmulatorHost);

/**
 * Add and remove config that you need.
 */
export default {
  // Instance
  env: ProcEnvHelper.getOrSetDefault('NODE_ENV', 'production'),
  gcpProjectId,
  port: ProcEnvHelper.getOrSetDefault('PORT', 8080),

  appDetails: {
    name: 'App Skeleton',
    frontend: {
      userApp: ProcEnvHelper.getOrSetDefault('FRONTEND_USER_APP_URL', 'https://localhost'),
    },
    domain: ProcEnvHelper.getOrSetDefault('DOMAIN', 'https://localhost'),
  },

  appMiddlewareOptions: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // Default source for all content types
          baseUri: ["'self'"], // Restrict base tag URLs to same origin
          mediaSrc: ['*', 'blob:', 'data:'], // Any media from anywhere
          fontSrc: ["'self'", 'https:', 'data:'], // Allow fonts from same origin, HTTPS, and data URIs
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          formAction: ["'self'"], // Restrict form submissions to same origin
          frameAncestors: ['*'], // Allow embedding in iframes from any domain
          imgSrc: ["'self'", 'data:', 'blob:'], // Allow images from same origin, data URIs and blobs
          objectSrc: ["'none'"], // Block all plugins (Flash, Java, etc.)
          frameSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'blob:'],
          workerSrc: ["'self'", 'blob:'], // Allow web workers
          connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'ws:', 'wss:'],
          upgradeInsecureRequests: [], // Upgrade HTTP requests to HTTPS
        },
      },
    },
  } as AppMiddlewareOptions,

  // Logger mode - Controls console.log verbosity
  // Options: 'error', 'warn', 'info', 'log', 'debug', 'verbose'
  // Each level includes all higher priority levels (e.g., 'info' includes 'error' and 'warn')
  loggerMode: ProcEnvHelper.getOrSetDefault('LOGGER_MODE', 'log'),

  // Dev Authentication — local development helpers
  devAuth: {
    /**
     * When enabled, every API request is automatically authenticated as
     * the configured dev user.  No real WorkOS login is required.
     *
     * APPLIES ONLY WHEN: devAutoSeed.enabled=true
     *
     * It will automatically:
     *   1. Seed the database with a DEV user
     *   2. Automatically create a session for any API request for the DEV user
     *
     * It will NOT automatically do anything else.
     */
    devAutoSeed: {
      enabled: ProcEnvHelper.getOrSetDefault('DEV_AUTO_SEED', false),
    },

    // Comma-separated list of emails that are granted the SUPER_ADMIN system
    // role on first login.
    superAdminEmails: String(ProcEnvHelper.getOrSetDefault('SUPER_ADMIN_EMAILS', ''))
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  // WorkOS Authentication (AuthKit)
  workos: {
    clientId: ProcEnvHelper.getOrSetDefault('WORKOS_CLIENT_ID', ''),
    apiKey: ProcEnvHelper.getOrSetDefault('WORKOS_API_KEY', ''),
    redirectUri: ProcEnvHelper.getOrSetDefault('WORKOS_REDIRECT_URI', 'https://localhost/api/auth/callback'),
    cookieDomain: ProcEnvHelper.getOrSetDefault('SESSION_COOKIE_DOMAIN', 'localhost'),
    sessionExpiryDays: ProcEnvHelper.getOrSetDefault('SESSION_EXPIRY_DAYS', 30),
    logoutRedirectUrl: ProcEnvHelper.getOrSetDefault('WORKOS_LOGOUT_REDIRECT_URL', 'https://localhost'),
  },

  // Google Cloud Storage — frontend asset bucket (prod serving path of
  // FrontendAssetsService; local dev serves from the /frontends dist folders)
  gcs: {
    bucketName: ProcEnvHelper.getOrSetDefault('GCS_FRONTEND_BUCKET', 'app-skeleton-frontends-dev'),
  },

  // Socket PubSub
  socketPubSub: {
    enabled: ProcEnvHelper.getOrSetDefault('SOCKET_PUBSUB_ENABLED', pubSubAvailable),
    projectId: String(ProcEnvHelper.getOrSetDefault('SOCKET_PUBSUB_PROJECT_ID', gcpProjectId)),
    emulatorHost: pubSubEmulatorHost,
    topicName: ProcEnvHelper.getOrSetDefault('SOCKET_PUBSUB_TOPIC', 'socket-events'),
    createTopicIfMissing: ProcEnvHelper.getOrSetDefault('SOCKET_PUBSUB_CREATE_TOPIC_IF_MISSING', false),
  },

  // EmailService
  email: {
    mode: ProcEnvHelper.getOrSetDefault('EMAIL_MODE', EmailerSendTypes.nodemailer),
    fallbackFrom: ProcEnvHelper.getOrSetDefault('EMAIL_FALLBACK_FROM', 'noreply@example.com'),
    supportEmail: ProcEnvHelper.getOrSetDefault('EMAIL_SUPPORT', 'support@example.com'),
    techEmail: ProcEnvHelper.getOrSetDefault('EMAIL_SUPPORT', 'support@example.com'),
    nodemailer: {
      port: ProcEnvHelper.getOrSetDefault('EMAIL_PORT', 587),
      host: ProcEnvHelper.getOrSetDefault('EMAIL_HOST', 'smtp.sendgrid.net'),
      secure: ProcEnvHelper.getOrSetDefault('EMAIL_SECURE', false),
      auth: {
        user: ProcEnvHelper.getOrSetDefault('EMAIL_USERNAME', undefined),
        pass: ProcEnvHelper.getOrSetDefault('EMAIL_PASSWORD', undefined),
      },
    },
  },

  // Mongodb connection details
  mongoDb: {
    mongoAdditionalParams: ProcEnvHelper.getOrSetDefault('MONGO_ADDITIONAL_PARAMS', 'retryWrites=true&w=majority'),
    mongoDatabase: ProcEnvHelper.getOrSetDefault('MONGO_DB', packageJson.name),
    mongoHost: ProcEnvHelper.getOrSetDefault('MONGO_HOST', 'changeme'),
    mongoPassword: ProcEnvHelper.getOrSetDefault('MONGO_PW', 'changeme'),
    mongoUser: ProcEnvHelper.getOrSetDefault('MONGO_USER', 'changeme'),
    mongoPort: ProcEnvHelper.getOrSetDefault('MONGO_PORT', false),
    mongoProtocol: ProcEnvHelper.getOrSetDefault('MONGO_PROTOCOL', 'mongodb+srv'),
    mongoUri: ProcEnvHelper.getOrSetDefault('MONGO_URI', false),
    mongoOpts: {
      ssl: ProcEnvHelper.getOrSetDefault('MONGO_SSL', undefined),
      // Cap the per-instance pool to bound deploy-overlap spikes against a
      // shared cluster's connection limit. Mongoose defaults to 100.
      maxPoolSize: Number(ProcEnvHelper.getOrSetDefault('MONGO_MAX_POOL_SIZE', 50)),
      minPoolSize: 0,
    },
  } as Config,
};
