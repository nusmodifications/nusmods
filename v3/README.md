NUSMods v3[![Coverage Status](https://coveralls.io/repos/github/nusmodifications/nusmods/badge.svg?branch=master)](https://coveralls.io/github/nusmodifications/nusmods?branch=master)
==

Highly based off the awesome [SurviveJS Webpack Guide](http://survivejs.com/webpack/).

#### Getting Started
Install [NodeJS 6+](https://nodejs.org/en/)
Install [Yarn](https://yarnpkg.com/en/docs/install)

```
$ yarn
$ yarn run build:dll # Do this whenever you update dependencies or change vendor bundle
$ yarn start
```

#### Development

Using the awesome `webpack.DllPlugin`, build (and rebuild) speeds can be increased. But first, you will have
to generate the dll file.

```
$ yarn run build:dll
$ yarn start
```

If you want to run the build for development without dll (why would you want to do that?), use the `-no-dll` flag.

```
$ yarn start -- -no-dll
```

#### Running tests
```
// run tests
$ yarn test

// writing tests with watch
$ yarn run test:watch

// run type checking
$ yarn run flow
```

#### Check code coverage
```
$ yarn run coverage
```

#### Build for Deployment
```
$ yarn run build
```
