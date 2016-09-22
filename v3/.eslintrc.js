module.exports = {
  "parser": "babel-eslint",
  "root": true,
  "extends": [
    "plugin:flowtype/recommended",
    "airbnb"
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
    // Consistent arrow parens
    "arrow-parens": [2, "as-needed", { "requireForBlockBody": true }],
    // After adding flowtypes the lines are getting longer.
    "max-len": ["error", 120],
    // We use webpack resolve root and this conflicts with that.
    "import/no-extraneous-dependencies": "off",
    // We use webpack resolve root and this conflicts with that.
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    "react/jsx-first-prop-new-line": ["error", "never"],
    // It just looks nicer without the space.
    "react/jsx-space-before-closing": "off",
    // TODO: Remove the following rule when eslint-config-airbnb updates to
    //       use "import/extensions rule from eslint-plugin-import"
    "react/require-extension": "off",
    // TODO: Replace divs with buttons, but remove all button styling
    "jsx-a11y/no-static-element-interactions": "off",
    // Let git handle the linebreaks instead
    "linebreak-style": "off",
  }
}
