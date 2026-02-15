# NUSMods R

NUSMods R is built using [React][react], [Redux][redux] and [Bootstrap][bootstrap], and is designed to be **fast, modern and responsive**.

- Production: https://nusmods.com/
- Latest build: https://latest.nusmods.com/
- Issues: https://github.com/nusmodifications/nusmods/issues?q=is%3Aissue+is%3Aopen
- Analytics: https://analytics.nusmods.com/
- Deployment dashboard: https://launch.nusmods.com/

## Browser support

Please refer to our [browserslist config](../packages/browserslist-config-nusmods).

## Contributing

Don't know where to start? First, read our repository [contribution guide](../CONTRIBUTING.md). Next, we highly recommend reading [this fantastic beginner's guide][zames-guide] written by one of our contributors. Alternatively, have a poke at our [open issues](https://github.com/nusmodifications/nusmods/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## Getting Started

Install [Node 18 LTS](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/docs/install) then run the following command:

```sh
$ yarn
```

This will install all of the dependencies you need.

### Development

To run the development build, simply run:

```sh
$ yarn start
```

This will start Webpack dev server, which will automatically rebuild and reload any code and components that you have changed.

We recommend the following development tools to help speed up your work

- React Developer Tools ([Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi), [Firefox](https://addons.mozilla.org/firefox/addon/react-devtools/))
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/)

### Writing styles

We use [CSS Modules][css-modules] to structure styles. This means that except for a few global styles, styles for each component lives beside their source files (see [colocation](#colocation)). This allows us to write short, semantic names for styles without worrying about collision.

```scss
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
```

```tsx
// MyComponent.tsx
import styles from './MyComponent.scss';

// To use styles from MyComponent.scss:
<div className={styles.myComponent}>
```

Note that specificity still matters. This is important if you are trying to override Bootstrap styles.

#### SCSS variables vs. CSS custom properties

Both SCSS and CSS variables (aka. custom properties) are used. In most cases, **prefer SCSS variables** as they can be used with SCSS mixins and functions, and integrate with Bootstrap. CSS variable generates more code (since we need to include a fallback for browsers that don't support it), and doesn't play well with SCSS.

Currently CSS variables are used only for colors that change under night mode.

### Importing images

Prefer SVG when possible. SVG images are usually smaller and more flexible. `.svg` files are loaded using [SVGR][svgr] as React components - this means you can add classnames, inline styles and other SVG attributes to the component loaded. SVGR also automatically optimizes the image.

```tsx
import CloudyIcon from 'img/weather/cloudy.svg';

const cloud = <CloudyIcon className={styles.myIcon} />;
```

PNG, JPEG and GIF files will be loaded using `url-loader` and can be imported as a string representing the URL of the asset after bundling. In production files smaller than 15kb will be converted into data URL

```tsx
import partyParrot from 'img/gif/partyparrot.gif';

const danceParty = <img src={partyParrot} alt=":partyparrot:" />;
```

To load SVG as files using `url-loader` instead, add the `?url` resource query to the end of the path.

```ts
import { Icon } from 'leaflet';
// eslint-disable-next-line import/extensions
import marker from 'img/marker.svg?url';

// Leaflet expects iconUrl to be a URL string, not a React component
new Icon({
  iconUrl: marker,
});
```

### Fetching data

We use Redux actions to make REST requests. This allows us to store request status in the Redux store, making it available to any component that needs it, and also allows the Redux store to cache the results from requests to make it offline if necessary. Broadly, our strategy corresponds to

#### Writing request actions

To write an action that makes a request, simple call and return the result from `requestAction(key: string, type?: string, options: AxiosXHRConfig)`.

- `type` should describe what the action is fetching, eg. `FETCH_MODULE`. By convention these actions should start with `FETCH_`.
- `key` should be unique for each endpoint the action calls. If the action will only call one endpoint then key can be omitted, and type will be used automatically. For example, fetch module calls a different endpoint for each module, so the key used is `FETCH_MODULE_[Module Code]`.
- `options` is passed directly to `axios()`, so [see its documentation][axios-config] for the full list of configs. Minimally `url` should be specified.

**Example**

```ts
import { requestAction } from 'actions/requests';

export const FETCH_DATA = 'FETCH_DATA';
export function fetchData() {
  return requestAction(FETCH_DATA, {
    url: 'http://example.com/api/my-data',
  });
}
```

#### Calling actions from components

Components should dispatch the action to fetch data. The dispatch function returns a Promise of the request response which the component can consume.

**Example**

```tsx
import { fetchData } from 'actions/example';

type Props = {
  fetchData: () => Promise<MyData>,
}

type State = {
  data: MyData | null,
  error?: any,
}

class MyComponent extends React.Component<Props, State> {
  state: State = {
    data: null,
  };

  componentDidMount() {
    this.props.fetchData()
      .then(data => this.setState({ data }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const { data, error } = this.state;

    if (error) {
      return <ErrorPage />;
    }

    if (data == null) {
      return <LoadingSpinner />;
    }

    // Render something with the data
  }
}

export default connect(null, { fetchData })(MyComponent);
```

#### Caching data

To make the data available offline, the data must be stored in the Redux store which is then persisted. To do this create a reducer which listens to `[request type] + SUCCESS`. The payload of the action is the result of the API call. Then in the component, instead of using the result from the Promise directly, we pull the data from the Redux store instead.

This is the [cache-then-network strategy described in the Offline Cookbook][offline-cookbook] and is similar to Workbox's revalidate-while-stale strategy.

**Note:** This assumes the result from the API will not be significantly different after it is loaded. If this is not the case, you might want to use another strategy, otherwise the user may be surprised by the content of the page changing while they're reading it, as the page first renders with stale data, then rerenders with fresh data from the server.

**Reducer example**

```ts
import { SUCCESS } from 'types/reducers';
import { FETCH_DATA } from 'actions/example';

export function exampleBank(state: ExampleBank, action: FSA): ExampleBank {
  switch (action.type) {
    case FETCH_DATA + SUCCESS:
      return action.payload;

    // Other actions...
  }

  return state;
}
```

**Component example**

```tsx
type Props = {
  myData: MyData | null,
  fetchData: () => Promise<MyData>,
}

type State = {
  error?: any,
}

class MyComponent extends React.Component<Props, State> {
  componentDidMount() {
    this.props.fetchData()
      .catch(error => this.setState({ error }));
  }

  render() {
    const { data, error } = this.state;

    // ErrorPage is only show if there is no cached data available
    // and the request failed
    if (error && !data) {
      return <ErrorPage />;
    }

    if (data == null) {
      return <LoadingSpinner />;
    }

    // Render something with the data
  }
}

export default connect(state => ({
  myData: state.exampleBank,
}), { fetchData })(MyComponent);
```

#### Getting request status

If you need to access the status of a request from outside the component which initiated the request, you can use the `isSuccess` and `isFailure` selectors to get the status of any request given its key.

### Adding dependencies

NUSMods tries to be as lean as possible. Adding external dependencies should be done with care to avoid bloating our bundle. Use [Bundlephobia][bundlephobia] to ensure the new dependency is reasonably sized, or if the dependency is limited to one specific page/component, use code splitting to ensure the main bundle's size is not affected.

#### TypeScript libdef

When adding packages, TypeScript requires a library definition, or libdef. To try to install one from the [community repository][definitely-typed], install `@types/<package name>`. Make sure the installed libdef's version matches that of the package.

If a community libdef is not available, you can try writing your own and placing it in `js/types/vendor`.

### Testing and Linting

We use [Jest][jest] with [Enzyme][enzyme] and [Testing Library][testing-library] to test our code and React components, [TypeScript][ts] for typechecking, [Stylelint][stylelint] and [ESLint][eslint] using [Airbnb config][eslint-airbnb] and [Prettier][prettier] for linting and formatting.

**Note: The majority of React tests are written with Enzyme. For new unit tests, please try to use [Testing Library][testing-library] instead!**

```sh
# Run all tests once with code coverage
$ yarn test

# Writing tests with watch
$ yarn test:watch

# Lint all JS and CSS
$ yarn lint

# Linting CSS, JS source, and run typechecking separately
$ yarn lint:styles
$ yarn lint:code
# Append `--fix` to fix lint errors automatically
# e.g. yarn lint:code --fix
# p.s. Use yarn lint:styles --fix with care (it's experimental),
#      remember to reset changes for themes.scss.

# Run TypeScript type checking
$ yarn typecheck
```

#### End to End testing

We currently have some simple E2E tests set up courtesy of Browserstack using Nightwatch. The purpose of this is mainly to catch major regression in browsers at the older end of our browser support matrix (iOS 11, Safari 11, Edge, Firefox ESR) which can be difficult to test manually.

By default the tests are ran against http://latest.nusmods.com, although they can be configured to run against any host, including localhost if you use [Browserstack's local testing feature](https://www.browserstack.com/docs/automate/javascript-testing/local-testing).

```sh
# All commands must include BROWSERSTACK_USER and BROWSERSTACK_ACCESS_KEY env variables
# these are omitted for brevity

# Run end to end test against staging
yarn e2e

# Run against deploy preview
LAUNCH_URL="https://nusmods-website-example-modsbots-projects.vercel.app" yarn e2e

# Run against local development server
yarn start              # Start a local development server
./BrowserStackLocal --key $BROWSERSTACK_ACCESS_KEY
LAUNCH_URL="http://localhost:8080" LOCAL_TEST=1 yarn e2e

# Run against local production server
yarn build              # Build to ./dist directory
npx serve -s dist       # Start a local server that serves ./dist
./BrowserStackLocal --key $BROWSERSTACK_ACCESS_KEY
LAUNCH_URL="http://localhost:5000" LOCAL_TEST=1 yarn e2e
```

### Deployment

**This section is outdated! We're overhauling our deployment processes at the moment. For more up-to-date (but which will also soon be outdated) deployment info, please refer to this [deployment guide](../DEPLOYMENT.md).**

Our staging is served from the `./dist` directory, which is generated using `yarn build`. From there, it can be promoted to production using `yarn promote-staging`. This flow is summarized below:

```sh
$ yarn                  # Install dependencies
$ yarn test             # Ensure all unit tests pass
$ yarn build            # Build to staging ./dist directory
# Open http://staging.nusmods.com and manually test to ensure it works
$ yarn promote-staging  # Promote ./dist to production
```

- `yarn build` packages and optimizes the app for deployment. The files will be placed in the `./dist` directory.
- `yarn promote-staging` deploys `./dist` to the production folder, currently `../../beta.nusmods.com`. It is designed to be safe, executing a dry run and asking for confirmation before deployment.
- `yarn rsync <dest-dir>` syncs `./dist` to the specified destination folder `<dest-dir>`. It is mainly used by `yarn promote-staging` but could be used to sync `./dist` to any folder.

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
│   │   ├── e2e              - End-to-end tests
│   │   ├── middlewares      - Redux middlewares
│   │   ├── reducers         - Redux reducers
│   │   ├── selectors        - Redux state selectors
│   │   ├── storage          - Persistance layer for Redux
│   │   ├── test-utils       - Utilities for testing - this directory is not counted
│   │   │                      for test coverage
│   │   ├── timetable-export - Entry point for timetable only build for exports
│   │   ├── types            - Type definitions
│   │       └── vendor       - Types for third party libaries
│   │   ├── utils            - Utility functions and classes
│   │   └── views
│   │       ├── components   - Reusable components
│   │       ├── contribute   - Contribute page components
│   │       ├── errors       - Error pages
│   │       ├── hocs         - Higher order components
│   │       ├── layout       - Global layout components
│   │       ├── modules      - Module finder and module info components
│   │       ├── optimiser    - Timetable optimiser related components
│   │       ├── planner      - Module planner related components
│   │       ├── routes       - Routing related components
│   │       ├── settings     - Settings page component
│   │       ├── static       - Static pages like /team and /developers
│   │       ├── timetable    - Timetable builder related components
│   │       ├── today        - Today schedule page related components
│   │       └── venues       - Venues page related components
│   └── styles
│       ├── bootstrap        - Bootstrapping, uh, Bootstrap
│       ├── components       - Legacy component styles
│       │                      (new components should colocate their styles)
│       ├── layout           - Site-wide layout styles
│       ├── material         - Material components
│       ├── pages            - Page specific styles
│       ├── tippy            - Styles for tippy.js tooltips
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
[testing-library]: https://testing-library.com/docs/react-testing-library/intro/
[ts]: https://www.typescriptlang.org/
[eslint]: https://eslint.org/
[svgr]: https://github.com/smooth-code/svgr
[eslint-airbnb]: https://www.npmjs.com/package/eslint-config-airbnb
[prettier]: https://prettier.io/docs/en/
[stylelint]: https://stylelint.io/
[zames-guide]: https://medium.com/@zameschua/getting-my-feet-wet-my-experience-with-open-source-and-nusmods-f1381450517e
[css-modules]: https://github.com/css-modules/css-modules
[offline-cookbook]: https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-then-network
[axios-config]: https://github.com/axios/axios#request-config
[definitely-typed]: https://github.com/DefinitelyTyped/DefinitelyTyped/
[bundlephobia]: https://bundlephobia.com/
