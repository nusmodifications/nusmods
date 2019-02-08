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
      },
    ],
    ['@babel/preset-react', { development: !IS_PROD }],
    '@babel/preset-flow',
  ];

  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-optional-chaining', { loose: true }],
  ];

  if (IS_DEV || IS_PROD) {
    plugins.push('lodash', '@babel/plugin-proposal-object-rest-spread');
  }
  if (IS_DEV) {
    plugins.push('react-hot-loader/babel');
  }
  if (IS_PROD) {
    // React Optimize plugins
    plugins.push(
      '@babel/transform-react-inline-elements',
      'transform-react-remove-prop-types',
      'transform-react-pure-class-to-function',
      'transform-react-constant-elements',
    );
  }
  if (IS_TEST) {
    plugins.push('dynamic-import-node');
  }

  return {
    presets,
    plugins,
  };
};
