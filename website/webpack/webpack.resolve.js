const path = require('path');

const ROOT = path.join(__dirname, '..');

module.exports = {
  resolve: {
    modules: [path.join(ROOT, 'src'), 'node_modules'],
    alias: {
      __mocks__: path.join(ROOT, 'src', '__mocks__'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    symlinks: true,
  },
};
