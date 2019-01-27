## Getting Started

Use `yarn` to install dependencies, then set up `env.json` with all the necessary keys, then run the test script to check the setup is okay.

```
yarn

cp env.example.json
vim env.example.json

yarn dev help
yarn dev test | yarn bunyan
```

## Yarn Commands

### For production

- `build` - use Babel to compile the code for production
- `scrape` - run the scraper. See CLI commands below for a list of commands. Remember to use `NODE_ENV=production` in production.

### For development

- `dev` - run the scraper through `babel-node`, which transpiles the source on the on the fly without having to rebuild the code every time. See CLI commands below for a list of commands.

  Do not use this in production because `babel-node` has poor performance.

- `bunyan` - pipe output from the scraper through this so they can be read on the CLI. This is an alias of `bunyan -L -o short --color` - use local timestamp, short output format and color formatting. Run `yarn bunyan --help` to see all options.
- `test` - run all unit and integration tests
  - `test:watch` - run tests in watch mode, which runs only when code is changed
- `lint` - run both linter and type checker
  = `lint:code` - lint the code through ESLint
  - `flow` - run Flow type checker

## CLI commands

Run these through `yarn scrape` in production or `yarn dev` in development piped through `yarn bunyan` for formatting - eg. `yarn dev test | yarn bunyan`. You can also run `yarn dev help` to see a list of all commands.

- `test` - run some simple API requests to check you have set everything up correctly
- `department` - download department and faculty codes
- `semester [sem] <year=current year>` - download data for a single academic year and semester. Year is optional and the current year is assumed if not provided.

## Data Pipeline

## Logging and error handling

## v2 Data Changes

### Module data

- `Types` is removed - this is not used anywhere in the v3 frontend

### Semester data

- `LecturePeriods` and `TutorialPeriods` are removed - these are not provided by the API, and it is a lot of work and space for not a lot of information
- `ExamDate` is now a proper ISO8601 date, formatted with TZ included to Singapore time (UTC+8)
- `ExamDuration` is a new nullable field providing the duration of the exam in minutes
