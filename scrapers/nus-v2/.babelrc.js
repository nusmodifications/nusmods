module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        tagets: { node: 'current' },
        useBuiltIns: 'entry',
      },
    ],
    '@babel/preset-flow',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-proposal-optional-chaining', { loose: true }],
  ],
};
