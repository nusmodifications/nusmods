const Nightwatch = require('nightwatch');
const browserstack = require('browserstack-local');
const path = require('path');
const startServer = require('./serve');

// Resolve files to the root of the script
const resolve = (filepath) => path.resolve(__dirname, '../', filepath);

// Start the server
try {
  process.mainModule.filename = resolve('./node_modules/.bin/nightwatch');

  // Code to start Browserstack local before start of test
  console.log('Connecting local');
  const bsLocal = new browserstack.Local();
  Nightwatch.bs_local = bsLocal;

  // Try to also stop the Browserstack process if the parent process is exiting
  process.on('exit', () => bsLocal.stop(() => {}));

  startServer()
    .then((server) =>
      bsLocal.start({ key: process.env.BROWSERSTACK_ACCESS_KEY }, (error) => {
        if (error) throw error;

        console.log('Connected. Now testing...');

        const done = () => bsLocal.stop(() => server.close());

        Nightwatch.cli((argv) => {
          Nightwatch.CliRunner(argv)
            .setup(null, done)
            .runTests(done);
        });
      }),
    )
    .catch((error) => {
      bsLocal.stop(() => {});
      throw error;
    });
} catch (error) {
  console.log('There was an error while starting the test runner:\n\n');
  process.stderr.write(`${error.stack}\n`);
  process.exit(2);
}
