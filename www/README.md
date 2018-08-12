# NUSMods R

NUSMods R is built using [React][react], [Redux][redux] and [Bootstrap][bootstrap], and is designed to be **fast, modern and responsive**.

* Production deployment: https://nusmods.com/
* Latest build: https://latest.nusmods.com/
* Issues: https://github.com/nusmodifications/nusmods/issues?q=is%3Aissue+is%3Aopen

To install NUSMods V2 (the previous version of NUSMods), refer [here](../provisioning/README.md).

## Browser support

Desktop browsers:

* Last two versions of all evergreen desktop browsers (Chrome, Firefox, Edge, Safari)
* IE is completely **unsupported**

Mobile browsers:

* iOS 9 and above
* Chrome Mobile last two versions

## Contributing

Don't know where to start? First, read our repository [contribution guide](../CONTRIBUTING.md). Next, we highly recommend reading [this fantastic beginner's guide][zames-guide] written by one of our contributors. Alternatively, have a poke at our [open issues](https://github.com/nusmodifications/nusmods/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## Getting Started

Install [Node 8+](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/docs/install) then run the following command:

```sh
$ yarn
```

This will install all of the dependencies you need.

### Development

To run the development build, simply run:

```sh
$ yarn start
```

This will start webpack dev server, which will automatically rebuild and reload any code and components that you have changed. We recommend the following development tools to help speed up your work

* React Developer Tools ([Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi), [Firefox](https://addons.mozilla.org/firefox/addon/react-devtools/))
* [Redux DevTools](http://extension.remotedev.io/#installation)
* [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/)

### Writing styles

We uses [CSS Modules][css-modules] to structure styles. This means that with the exception of a few global styles, styles for each component lives beside their source files (see [colocation](#colocation)). This allows us to write short, semantic names for styles without worrying about collision.

```
// MyComponent.scss
import "~styles/utils/modules-entry"; // Import variables, mixins

.myComponent {
  // .col will be included in the class name whenever .myComponent is used
  composes: col from global;
  color: theme-color();

  :global(.btn) {
    // Selects all child .btn elements
  }

  :global {
    // :global is required for animation since animations are defined globally
    animation: fadeIn 0.3s;
  }
}

// MyComponent.jsx
import styles from './MyComponent.scss';

// To use styles from MyComponent.scss:
<div className={styles.myComponent}>
```

Note that specificity still matters. This is important if you are trying to override Bootstrap styles.

#### SCSS variables vs. CSS custom properties

Both SCSS and CSS variables (aka. custom properties) are used. In most cases, **prefer SCSS variables** as they can be used with SCSS mixins and functions, and integrate with Bootstrap. CSS variable generates more code (since we need to include a fallback for browsers that don't support it), and doesn't play well with SCSS.

Currently CSS variables are used only for colors that change under night mode.

### Testing and Linting

We use [Jest][jest] with [Enzyme][enzyme] to test our code and React components, [Flow][flow] for typechecking, [Stylelint][stylelint] and [ESLint][eslint] using [Airbnb config][eslint-airbnb] and [Prettier][prettier] for linting and formatting.

```sh
# Run all tests once with code coverage
$ yarn test

# Writing tests with watch
$ yarn test:watch

# Lint all JS and CSS
$ yarn lint

# Linting CSS, JS source, tests and scripts separately
$ yarn lint:styles
$ yarn lint:src
$ yarn lint:test
$ yarn lint:scripts
# Append `--fix` to fix lint errors automatically
# e.g. yarn lint:src --fix
# p.s. Use yarn lint:styles --fix with care (it's experimental),
#      remember to reset changes for themes.scss.

# Run Flow type checking
$ yarn flow
```

#### End to End testing

We currently have some simple E2E tests set up courtesy of Browserstack using Nightwatch. The purpose of this is mainly to catch major regression in browsers at the older end of our browser support matrix (Safari 9, Edge, Firefox ESR) which can be difficult to test manually.

By default the tests are ran against http://staging.nusmods.com, although they can be configured to run against any host, including localhost if you use [Browserstack's local testing feature](https://www.browserstack.com/local-testing#command-line).

```sh
# All commands must include BROWSERSTACK_USER and BROWSERSTACK_ACCESS_KEY env variables
# these are omitted for brevity

# Run end to end test against staging
yarn e2e

# Run against deploy preview
LAUNCH_URL="https://deploy-preview-1024--nusmods.netlify.com" yarn e2e

# Enable local testing
./BrowserStackLocal --key $BROWSERSTACK_ACCESS_KEY
LAUNCH_URL="http://localhost:8080" lOCAL_TEST=1 yarn e2e
```

### Deployment

Our staging is served from the `./dist` directory, which is generated using `yarn build`. From there, it can be promoted to production using `yarn promote-staging`. This flow is summarized below:

```sh
$ yarn # Install dependencies
$ yarn test # Ensure all unit tests pass
$ yarn build # Build to staging ./dist directory
# Manually ensure staging build works.
$ yarn promote-staging # Promote ./dist to production
```

* `yarn build` packages and optimizes the app for deployment. The files will be placed in the `./dist` directory.
* `yarn promote-staging` deploys `./dist` to the production folder, currently `../../beta.nusmods.com`. It is designed to be safe, executing a dry run and asking for confirmation before deployment.
* `yarn rsync <dest-dir>` syncs `./dist` to the specified destination folder `<dest-dir>`. It is mainly used by `yarn promote-staging` but could be used to sync `./dist` to any folder.

## Project Structure

```
├── scripts                  - Command line scripts to help with development
├── src
│   ├── img
│   ├── js
│   │   ├── actions          - Redux actions
│   │   ├── apis             - Code to interface with external APIs
│   │   ├── bootstrapping    - Code that runs once only on app initialization
│   │   ├── config           - App configuration
│   │   ├── data             - Static data such as theme colors
│   │   ├── middlewares      - Redux middlewares
│   │   ├── reducers         - Redux reducers
│   │   ├── storage          - Persistance layer for Redux
│   │   ├── test-utils       - Utilities for testing - this directory is not counted
│   │   │                      for test coverage
│   │   ├── timetable-export - Entry point for timetable only build for exports
│   │   ├── types            - Flow type definitions
│   │   ├── utils            - Utility functions and classes
│   │   └── views
│   │       ├── browse       - Module info and module finder related components
│   │       ├── components   - Reusable components
│   │       ├── errors       - Error pages
│   │       ├── hocs         - Higher order components
│   │       ├── layout       - Global layout components
│   │       ├── modules      - Module finder and module info components
│   │       ├── routes       - Routing related components
│   │       ├── settings     - Settings page component
│   │       ├── static       - Static pages like /team and /developers
│   │       ├── timetable    - Timetable builder related components
│   │       └── venues       - Venues page related components
│   └── styles
│       ├── bootstrap        - Bootstrapping, uh, Bootstrap
│       ├── material         - Material components
│       ├── components       - Legacy component styles
│       │                      (new components should colocate their styles)
│       ├── layout           - Site-wide layout styles
│       ├── pages            - Page specific styles
│       └── utils            - Utility classes, mixins, functions
├── static                   - Static assets, eg. favicons
│                              These will be copied directly into /dist
└── webpack                  - webpack config
```

### Colocation

Components should keep their styles and tests in the same directory with the same name. For instance, if you have a component called `MyComponent`, the files should look like

```
├── MyComponent.jsx         - Defines the component MyComponent
├── MyComponent.test.jsx    - Tests for MyComponent
└── MyComponent.scss        - Styles for MyComponent
```

[react]: https://reactjs.org/
[redux]: http://redux.js.org/
[bootstrap]: https://getbootstrap.com/
[jest]: https://facebook.github.io/jest/
[enzyme]: http://airbnb.io/enzyme/
[flow]: https://flow.org/
[eslint]: https://eslint.org/
[eslint-airbnb]: https://www.npmjs.com/package/eslint-config-airbnb
[prettier]: https://prettier.io/docs/en/
[stylelint]: https://stylelint.io/
[zames-guide]: https://medium.com/@zameschua/getting-my-feet-wet-my-experience-with-open-source-and-nusmods-f1381450517e
[css-modules]: https://github.com/css-modules/css-modules
