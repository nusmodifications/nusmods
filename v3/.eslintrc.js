module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "airbnb",
    "plugin:flowtype/recommended"
  ],
  "env": {
    "browser": true,
    "node": true
  },
  "plugins": [
    "react",
    "jsx-a11y",
    "import",
    "flowtype"
  ],
  "rules": {
    // Turning it on causes undecipherable errors.
    "arrow-body-style": "off",
    // We use webpack resolve root and this conflicts with that.
    "import/no-extraneous-dependencies": "off",
    // We use webpack resolve root and this conflicts with that.
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    "react/jsx-first-prop-new-line": ["error", "never"],
    // It just looks nicer without the space.
    "react/jsx-space-before-closing": "off",
    // TODO: Remove the following rule when eslint-config-airbnb updates to use "import/extensions rule from eslint-plugin-import"
    "react/require-extension": "off",
    // Let git handle the linebreaks instead
    "linebreak-style": "off",
  }
}
