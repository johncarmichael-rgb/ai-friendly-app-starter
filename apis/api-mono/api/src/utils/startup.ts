import mongoose from 'mongoose';
import loadMongoose from 'load-mongoose';
import path from 'path';
import process from 'process';
import config from '@/config';

// The server opens its port before Mongo is connected (listen-first, see
// server.ts) and Cloud Run routes traffic as soon as the port is open, so a
// request can arrive while Mongoose is still connecting. Mongoose buffers those
// operations until the connection is `open`, but the default bufferTimeoutMS is
// 10s — too short if a deploy-overlap connection spike slows the connect. Raise
// it so early requests wait for the DB rather than 500ing. Set at module load
// (before the port opens) so no operation can be buffered with the old value.
mongoose.set('bufferTimeoutMS', Number(process.env.MONGO_BUFFER_TIMEOUT_MS) || 30_000);
import { emailerSetupAsync } from 'nunjucks-emailer';
import { EmailerConstructor } from 'nunjucks-emailer/build/interfaces/EmailerContructor';
import { runMigrations } from '@/utils/migrationRunner';
import seedFeatures from '@/utils/seedFeatures';
import syncPermissions from '@/utils/syncPermissions';

// Connect to Mongo with exponential-backoff retry. Without this, a single
// slow/failed server-selection (default 30s timeout) during a peak-traffic
// deploy rejects startup() -> the process exits -> the Cloud Run revision
// fails. Retrying lets a transient slow connect self-heal.
// NB: this runs in the BACKGROUND after the port is already listening (see
// server.ts). The startup probe is a TCP check on the port, so it passes
// independently of the DB; requests that arrive mid-connect are buffered by
// Mongoose (see bufferTimeoutMS above) until the connection establishes.
const MAX_DB_CONNECT_ATTEMPTS = 10;
const connectWithRetry = async (attempt = 1): Promise<void> => {
  try {
    await loadMongoose(config.mongoDb);
  } catch (err) {
    if (attempt >= MAX_DB_CONNECT_ATTEMPTS) {
      throw err;
    }
    const delayMs = Math.min(1000 * 2 ** (attempt - 1), 30_000);
    console.error(
      `Mongo connect failed (attempt ${attempt}/${MAX_DB_CONNECT_ATTEMPTS}), retrying in ${delayMs}ms:`,
      err,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return connectWithRetry(attempt + 1);
  }
};

// eslint-disable-next-line max-lines-per-function
export default async () => {
  // Load all database connections
  console.log('Mongo atlas database connecting');
  await connectWithRetry();
  console.log('Mongo atlas database connection established: ' + config.mongoDb.mongoHost);

  // Run database migrations
  console.log('Database migrations started');
  runMigrations()
    .then(() => {
      console.log('Database migrations finished');
    })
    .catch((err) => {
      console.error('Database migrations error: ', err);
    });

  // Seed feature definitions
  console.log('Seed features started');
  seedFeatures()
    .then(() => {
      console.log('Seed features finished');
    })
    .catch((err) => {
      console.error('Seed features finished', err.message);
    });

  // Sync permissions from OpenAPI file
  const shouldWriteBackPermissions = config.env === 'local' || config.env === 'develop';

  console.log('Sync permissions started');
  syncPermissions({ writeBackToDisk: shouldWriteBackPermissions })
    .then(() => {
      console.log('Sync permissions finished');
    })
    .catch((err) => {
      console.error('Sync permissions error: ', err);
    });

  // Setup the emailer
  const emailerSetup: EmailerConstructor = {
    templatePath: path.join(process.cwd(), 'emails/templates'),
    logPath: path.join(process.cwd(), 'emails/logs'),
    sendType: config.email.mode,
    fallbackFrom: {
      email: config.email.fallbackFrom,
      name: config.appDetails.name,
    },
    fallbackSubject: config.appDetails.name,
    makeCssInline: true,
    makeCssInlineOptions: {
      url: config.appDetails.frontend.userApp,
      preserveMediaQueries: true,
    },
    templateGlobalObject: {
      frontend: config.appDetails.frontend,
      noReply: config.email.fallbackFrom,
    },
    nodemailer: {
      port: config.email.nodemailer.port,
      host: config.email.nodemailer.host,
      secure: config.email.nodemailer.secure,
      auth:
        config.email.nodemailer.auth.user && config.email.nodemailer.auth.pass
          ? config.email.nodemailer.auth
          : undefined,
    },
  };

  console.log('Setting up emailer');
  await emailerSetupAsync(emailerSetup);
  console.log(
    `Setup email: EmailerSetupAsync in mode '${config.email.mode}' with fallbacks as ${JSON.stringify(config.email.fallbackFrom)}`,
  );
};
