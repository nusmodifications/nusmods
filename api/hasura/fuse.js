/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
// Set cache folder to node_modules subpath
process.env.FUSEBOX_TEMP_FOLDER = path.resolve('./node_modules/.fusebox');
// Set node env to development mode
process.env.NODE_ENV = 'development';

const { FuseBox } = require('fuse-box');

const fuse = FuseBox.init({
  homeDir: 'src',
  output: 'dist/$name.js',
});

fuse.dev({ port: 4445, httpServer: false });

fuse
  .bundle('server')
  .instructions('> [index.ts]')
  .watch()
  // Execute process right after bundling is completed
  // launch and restart express
  .completed((proc) => proc.require());

fuse.run({
  chokidar: {
    usePolling: true,
  },
});
