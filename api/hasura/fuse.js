/* eslint-disable import/no-extraneous-dependencies */
// Set cache folder to node_modules subpath
process.env.FUSEBOX_TEMP_FOLDER = 'node_modules/.fusebox';

const { FuseBox } = require('fuse-box');

const fuse = FuseBox.init({
  homeDir: 'src',
  useTypescriptCompiler: true,
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

fuse.run();
