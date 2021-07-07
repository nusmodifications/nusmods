# NUS Scraper

This folder contains the scraper which produces our [v2 API data][api-v2] from internal NUS APIs.

**Note:** as this project gets its data from internal NUS APIs, you won't be able to contribute to this project without having the API domain and auth keys. Sadly, at the request of the university, we won't be able to release this information to non-core developers. If you have any ideas to improve the scraper, please [create an issue](https://github.com/nusmodifications/nusmods/issues/new/choose) instead.

## Getting Started

Node LTS is required. We use Node 12 in production.

Use `yarn` to install dependencies, then set up `env.json` with all the necessary keys and API base URL, then run the test script to check the setup is okay.

```sh
yarn

cp env.example.json env.json
vim env.json  # add your appKey, studentKey and the baseUrl here

yarn dev help
yarn dev test | yarn bunyan
```

### Setting up ElasticSearch

We use ElasticSearch for our module search page. For local development it is not necessary to set this up because the scraper will automatically fall back to storing all data on the file system. To set up the ElasticSearch config, simple specify the `elasticConfig` key in `env.json` with the necessary configuration options that will be passed into the ElasticSearch client.

## Yarn Commands

### For production

- `build` - use Babel to compile the code for production
- `scrape` - run the scraper. See CLI commands below for a list of commands. Remember to use `NODE_ENV=production` in production.
- `docs` - copy the Swagger docs into the data folder

### For development

- `scrape` - run the scraper (see below for CLI commands). Note that the scraper has to be compiled through the `build` command first
- `dev` - compile and run the scraper. This is the same as running `build` and `scrape`
- `build` - compile the scraper using the TypeScript compiler
- `bunyan` - pipe output from the scraper through this so they can be read on the CLI. This is an alias of `bunyan -L -o short --color` - use local timestamp, short output format and color formatting. Run `yarn bunyan --help` to see all options.
- `test` - run all unit and integration tests
  - `test:watch` - run tests in watch mode, which runs only when code is changed
- `lint` - run both linter and type checker
  - `lint:code` - lint the code through ESLint


## CLI commands

Run these through `yarn scrape` in production or `yarn dev` in development piped through `yarn bunyan` for formatting - eg. `yarn dev test | yarn bunyan`. You can also run `yarn dev help` to see a list of all commands.

- `test` - run some simple API requests to check you have set everything up correctly
- `departments` - download department and faculty codes
- `semester [sem]` - download module and timetable data for the given semester
- `venue [sem]` - collate venue data into the shape needed by the frontend
- `combine` - combine the module data for all four semesters together
- `all` - run the complete pipeline from start to end

## Data Pipeline

- Get department / faculty codes (`GetDepartmentFaculty`)
- Get semester data for all four semesters (`GetSemesterData`)
  - Get semester modules (`GetSemesterModules`)
    - Get module timetable for each department (`GetModuleTimetable`)
  - Get semester exams (`GetModuleExams`)
- Collate venues (`CollateVenues`)
- Collate modules (`CombineModules`)

## Logging and error handling

Logging is done via [Bunyan][bunyan]. When logging things, use the first parameter to hold variables, and make the message the same for all errors of the same type. This allows for easier searching.

The application automatically streams `info` to `logs/info.log` and `logs/errors.log` as well as Sentry (for error and fatal events) and stdout. On production the logs are suffixed by the date and time of the run to make it easier to find the correct log.

Use `yarn bunyan`, which comes with some presets to make things easier to work with in the CLI.

Error handling is done through Sentry.

## v2 Data Changes

This section details the differences between our [v1][api-v1] and [v2][api-v2] APIs.

### Module data

All keys are switched from TitleCase to camelCase.

- `Faculty` is provided in addition to `Department`
- `Types` is removed - this is not used anywhere in the v3 frontend because it is difficult to keep up to date
- `Workload` will now be parsed on the server into a tuple of 5 numbers. A string is only returned if the text is unparsable.
- `ModmavenTree` is renamed to `PrereqTree`, is now optional, and is represented by a recursive tree of `type PrereqTree = string | { ['and' | 'or']: PrereqTree[] }`
- `LockedModules` is renamed to `FulfillRequirements`
- `History` has been renamed `SemesterData`
- `Aliases` is a new optional field that contains module codes for dual-coded modules

### Semester data

- `LecturePeriods` and `TutorialPeriods` are removed - these are not provided by the API, and it is a lot of work and space for not a lot of information
- `ExamDate` is now a proper ISO8601 date string
- `ExamDuration` is a new nullable number field providing the duration of the exam in minutes
- `FacultyDepartment` will now be published under yearly data, not semester

### Lesson data

- `WeekText` is now just `Weeks` and is a either a sorted array of numbers representing academic week numbers, or a `WeekRange` object representing lessons that take place outside the normal academic weeks, such as during holidays or recess weeks. This is the structure:

  ```ts
  type WeekRange = {
    // The start and end dates
    start: string;
    end: string;
    // Number of weeks between each lesson. If not specified one week is assumed
    // ie. there are lessons every week
    weekInterval?: number;
    // Week numbers for modules with uneven spacing between lessons. The first
    // occurrence is on week 1
    weeks?: number[];
  };
  ```

### Venue data

- `Availability` now only marks occupied times. Vacant times are simply left out of the object.

[api-v1]: https://api.nusmods.com
[api-v2]: https://api.nusmods.com/v2
[bunyan]: https://github.com/trentm/node-bunyan
