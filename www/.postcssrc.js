module.exports = {
  plugins: {
    autoprefixer: {},
    "postcss-custom-properties": {
      preserve: true, // Preserve the original CSS variable declaration
      warnings: false, // Ignore warnings about variables declared on non-:root selectors
    }
  }
};
