module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  const IS_PROD = api.env('production');
  const IS_DEV = api.env('development');
  const IS_TEST = api.env('test');

  const presets = [
    [
      '@babel/preset-env',
      {
        // eslint-disable-next-line global-require
        targets: IS_TEST ? { node: true } : { browsers: require('./package.json').browserslist },
        modules: IS_TEST ? 'commonjs' : false,
        // Exclude transforms that make all code slower
        // See https://github.com/facebook/create-react-app/pull/5278
        exclude: ['transform-typeof-symbol'],
      },
    ],
    ['@babel/preset-react', { development: !IS_PROD }],
    '@babel/preset-flow',
  ];

  const plugins = [
    '@babel/plugin-syntax-dynamic-import',
    // // See https://github.com/facebook/create-react-app/issues/4263
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-optional-chaining', { loose: true }],
  ];

  if (IS_DEV || IS_PROD) {
    plugins.push('babel-plugin-lodash', [
      '@babel/plugin-proposal-object-rest-spread',
      { useBuiltIns: true },
    ]);
  }
  if (IS_DEV) {
    plugins.push('react-hot-loader/babel');
  }
  if (IS_PROD) {
    // React Optimize plugins
    plugins.push(
      '@babel/plugin-transform-react-inline-elements',
      '@babel/plugin-transform-react-constant-elements',
      'babel-plugin-transform-react-remove-prop-types',
      'babel-plugin-transform-react-class-to-function',
    );
  }
  if (IS_TEST) {
    plugins.push('babel-plugin-dynamic-import-node');
  }

  return {
    presets,
    plugins,
  };
};
