const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback');
const serveStatic = require('serve-static');

const join = (...filepath) => path.resolve(__dirname, '../', ...filepath);

/**
 * Starts a simple web server to do manual or e2e testing with
 */
function startServer(dir = 'dist', port = 9015) {
  return new Promise((resolve) => {
    const server = express()
      .use(history())
      .use(serveStatic(join(dir)))
      .listen(port, () => resolve(server));
  });
}

module.exports = startServer;

if (require.main === module) {
  startServer();
}
