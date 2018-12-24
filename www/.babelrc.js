module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 2 versions', 'iOS >= 9', 'Safari >= 9', 'not ie <= 11'],
        },
        modules: false,
        useBuiltIns: false,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  env: {
    development: {
      plugins: ['react-hot-loader/babel'],
    },
    production: {
      plugins: [
        // React Optimize plugins
        '@babel/transform-react-inline-elements',
        'transform-react-remove-prop-types',
        'transform-react-pure-class-to-function',
        'transform-react-constant-elements',
      ],
    },
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs', 'dynamic-import-node'],
    },
  },
  plugins: [
    'lodash',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-optional-chaining', { loose: true }],
  ],
};
