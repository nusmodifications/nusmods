# browserslist-config-nusmods

This package contains the [browserslist config](https://github.com/browserslist/browserslist) obtained from our [own analytics](https://analytics.nusmods.com).

The config ensures that we support 98% of our users' devices.

## Installation

```sh
yarn
```

## Generating config files

```sh
yarn start
```

Files `index.js` and `browserslist-stats.json` will be generated.

### `index.js` file

Entry point for a custom browserslist config as laid out in https://github.com/browserslist/browserslist#custom-usage-data.

### `browserslist-stats.json`

A json file which lists the percentage of each browser's version the visitors are on when they visit NUSMods.
