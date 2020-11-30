const config = {
  plugins: [require('autoprefixer')],
};

// Use CSSNano in production to minify CSS
if (process.env.NODE_ENV === 'production') {
  config.plugins.push(require('cssnano'));
}

module.exports = config;
