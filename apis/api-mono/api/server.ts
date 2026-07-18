// Enable source map support for accurate TypeScript line numbers in logs
import 'source-map-support/register';

import '@/http/nodegen/utils/logger';
import app from '@/app';
import appCli from '@/app.cli';
import startup from '@/utils/startup';
import run from '@/cli/run';
import config from '@/config';
import packageJson from './package.json';

const cliInput = appCli();
const PORT = cliInput.port || config.port;

app(PORT)
  .then(async (http) => {
    if (cliInput['run-script']) {
      // CLI path (dev only — run.ts throws in production): the DB must be
      // connected before the script runs, so await startup first.
      await startup();
      return run(cliInput['run-script'], cliInput);
    }

    // Server path: open the port immediately so the container is "started"
    // (the Cloud Run startup probe is a TCP check on the port), then connect
    // Mongo + finish startup in the background. Requests that arrive before the
    // DB is up are buffered by Mongoose until the connection establishes.
    await http.start();
    console.log(`${packageJson.name}:${packageJson.version} server listening on port: ${PORT}`);
    startup()
      .then(() => console.log('api startup complete — Mongo connected'))
      .catch((e) => {
        console.error('api startup failed, exiting:', e);
        process.exit(1);
      });
  })
  .catch((e) => {
    throw e;
  });
