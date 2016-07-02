const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  resolve: {
    root: [
      path.join(__dirname, 'src'),
      path.join(__dirname, 'src/js'),
      path.join(__dirname, 'src/styles')
    ]
  },
  entry: {
    app: 'main'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};
