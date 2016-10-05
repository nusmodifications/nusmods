NUSMods v3[![Coverage Status](https://coveralls.io/repos/github/nusmodifications/nusmods/badge.svg?branch=master)](https://coveralls.io/github/nusmodifications/nusmods?branch=master)
==

Highly based off the awesome [SurviveJS Webpack Guide](http://survivejs.com/webpack/).

#### Getting Started

```
$ npm install
$ npm run build:dll # Do this whenever you update dependencies or change vendor bundle
$ npm start
```

#### Development

Using the awesome `webpack.DllPlugin`, build (and rebuild) speeds can be increased. But first, you will have
to generate the dll file.

```
$ npm run build:dll
$ npm start
```

If you want to run the build for development without dll (why would you want to do that?), use the `-no-dll` flag.

```
$ npm start -- -no-dll
```

#### Running tests
```
// run tests
$ npm test

// writing tests with watch
$ npm run test:watch

// run type checking
$ npm run flow
```

#### Check code coverage
```
$ npm run coverage
```

#### Build for Deployment
```
$ npm run build
```
