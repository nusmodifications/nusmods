# NUSMods v3 [![Coverage Status](https://coveralls.io/repos/github/nusmodifications/nusmods/badge.svg?branch=master)](https://coveralls.io/github/nusmodifications/nusmods?branch=master) [![Build Status](https://travis-ci.org/nusmodifications/nusmods.svg?branch=hello-team-yijiang)](https://travis-ci.org/nusmodifications/nusmods)

**Talk to us!**

- Telegram: https://telegram.me/NUSMods

NUSMods v3 is built using [React][react], [Redux][redux], [Bootstrap][bootstrap] and is designed to be **fast, modern and responsive**.

## Browser support

Desktop browsers:

- Last two versions of all evergreen desktop browsers (Chrome, Firefox, Edge, Safari)
- IE is completely **unsupported**

Mobile browsers:

- iOS 9 and above
- Chrome Mobile last two versions

## Contributing

Don't know where to start? One of our contributors, wrote [this fantastic beginner guide][zames-guide], it is highly recommended that you have a read.

## Getting Started

Install [NodeJS 8+](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/docs/install) then run the following command:

```sh
$ yarn
```

This will install all of the dependencies you need.

### Development

To run the development build, simply run:

```sh
$ yarn start
```

This will start Webpack dev server, which will automatically rebuild and reload any code and components that you have changed. We recommend the following development tools to help speed up your work

- React developer tool ([Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi), [Firefox](https://addons.mozilla.org/firefox/addon/react-devtools/))
- [Redux developer tool](http://extension.remotedev.io/#installation)
- [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/)

### Running tests and linter

We use [Jest][jest] with [Enzyme][enzyme] to test our code and React components, and [Flow][flow], [Stylelint][stylelint] and [ESLint][eslint] using [AirBnB config][eslint-airbnb] for linting.

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

# Run Flow type checking
$ yarn flow
```

### Build for Deployment

```sh
$ yarn build
```

This will package and optimize the app for deployment. The files will be placed in the `/dist` directory.

## Project structure

```
├── scripts                 - Command line scripts to help with development
├── src
│   ├── img
│   ├── js
│   │   ├── actions         - Redux actions
│   │   ├── apis            - Code to interface with external APIs
│   │   ├── config          - App configuration
│   │   ├── data            - Static data such as theme colors
│   │   ├── middlewares     - Redux middlewares
│   │   ├── reducers        - Redux reducers
│   │   ├── storage         - Persistance layer for Redux
│   │   ├── stores          - Redux store config
│   │   ├── types           - Flow type definitions
│   │   ├── utils           - Utility functions and classes
│   │   └── views
│   │       ├── browse      - Module info and module finder related components
│   │       ├── components  - Reusable components
│   │       ├── errors      - Error pages
│   │       ├── layout      - Global layout components
│   │       ├── settings    - Settings page component
│   │       ├── static      - Static pages like /team and /developers
│   │       └── timetable   - Timetable builder related components
│   └── styles
│       ├── bootstrap       - Bootstraping, uh, Bootstrap
│       ├── components      - Legacy component styles
|       |                     (new components should colocate their styles)
│       ├── layout          - Site-wide layout styles
│       ├── pages           - Page specific styles
│       ├── utils           - Utility classes, mixins, functions
│       └── vendor          - External vendor styles
├── static                  - Static assets, eg. favicons
|                             These will be copied directly into /dist
└── webpack                 - Webpack config
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
[stylelint]: https://stylelint.io/
[zames-guide]: https://medium.com/@zameschua/getting-my-feet-wet-my-experience-with-open-source-and-nusmods-f1381450517e
