# NUSMods - NUS Data Scrapers

This scraper consolidates and normalizes various bits of NUS module information
from the following sources:

* [CORS historical bidding statistics](http://www.nus.edu.sg/cors/archive.html)
* [CORS module information listings](http://www.nus.edu.sg/cors/schedule.html#corsmodinfo)
* [IVLE API](https://wiki.nus.edu.sg/display/ivlelapi/Home)
* [NUS Bulletin](http://www.nus.edu.sg/registrar/nusbulletin/modulesearch.html)
* [NUS Examination Time-Table](http://www.nus.edu.sg/registrar/event/examschedule-sem1.html)
* [NUS Living Lab API](https://nuslivinglab.nus.edu.sg/)

The scraped data used by the NUSMods website can be browsed at
<https://api.nusmods.com>. API documentation can be found
[here](../../api/data).

The scraped data is stored in easy to use static JSON files in a data folder in
the repository root.

To be respectful to NUS servers, and reduce waiting while developing, the
crawlers use simple local file system caching and HTTP `if-modified-since`
headers. They are modular, being written as separate gulp tasks, so if only a
subset of information is required, it can be specified down to individual
semesters.

## Initial Setup

1. Copy `.env.example` to a file named `.env`.
1. Get an API key from [IVLE](https://ivle.nus.edu.sg/LAPI/default.aspx) and put
   it in `.env` under `IVLE_API_KEY`.
1. Download and install [Node.js](https://nodejs.org), [npm](https://npmjs.org)
   and [yarn](https://yarnpkg.com/en/docs/install).
1. Run the following command in a terminal:

    ```bash
    $ yarn # install node dependencies
    ```

## Updating Module Information

The default gulp task is set to scrape the semester data in the upcoming month. The following commands are valid:

```bash
$ yarn build:scraper && yarn scrape # production use
$ yarn scrape:dev # development use
```

Invoking sub-tasks would involve calling the task by changing the commands in `package.json`, or through
installing `gulp-cli` globally. For example, to run the `examTimetable` task specifically:

```bash
$ gulp examTimetable
```

For a list of all tasks available run

```bash
$ gulp --tasks
```

## Task Configuration and Targets

Many of the tasks have multiple targets, and can have more defined if necessary. In order to configure file-paths and runtime settings, take a look at `config.js`.

If you want to parse a specific year or semester, take a look at `gulpfile.babel.js`. Each task will look something like below:

```js
gulp.task('bulletinModules', () => {
  const subtasks = iterateSems({
    from: 2017, // change this to year you want to start from
    to: 2018, // year to end parsing
    semesters: [1, 2, 3, 4], // sem 1, 2 and the 2 special semesters
    config: config.bulletinModules, // configuration as found in config.js
  });

  const bulletinModules = R.map(tasks.bulletinModules, subtasks);
  return Promise.all(bulletinModules);
});
```
