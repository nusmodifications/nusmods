# NUSMods API [![Code Climate](http://img.shields.io/codeclimate/github/nusmodifications/nusmods-api.svg)](https://codeclimate.com/github/nusmodifications/nusmods-api) [![Dependency Status](http://img.shields.io/david/nusmodifications/nusmods-api.svg)](https://david-dm.org/nusmodifications/nusmods-api)

NUSMods API consolidates and normalizes various bits of NUS module information
from the following sources:

- [CORS historical bidding statistics](http://www.nus.edu.sg/cors/archive.html)
- [CORS module information listings](http://www.nus.edu.sg/cors/schedule.html#corsmodinfo)
- [IVLE API](http://wiki.nus.edu.sg/display/ivlelapi/Home)
- [NUS Bulletin](http://www.nus.edu.sg/registrar/nusbulletin/modulesearch.html)
- [NUS Examination Time-Table](http://www.nus.edu.sg/registrar/event/examschedule-sem1.html)
- [NUS Living Lab API](http://nuslivinglab.nus.edu.sg/)

It is a purely JSON API, with CORS and JSONP support, and is statically
generated - since the module information changes a few times a day at most, this
allows the API to be as fast as possible, and be completely browsable at
http://api.nusmods.com.

The raw and intermediate processed JSON are also available, in addition to the
fully processed and normalized JSON. JSON property names are UpperCamelCase and
match the equivalent IVLE API property names where possible to adhere to the
principle of least astonishment.

To be respectful to NUS servers, and reduce waiting while developing, the
crawlers use simple local filesystem caching and HTTP `if-modified-since`
headers. They are modular, being written as separate gulp tasks, so if only a
subset of information is required, it can be specified down to individual
semesters.

## Contributing

The API is still in its infancy, and there are plenty more endpoints that could
be integrated, and other formats that might be useful, like CSV. Suggestions are
very welcome, and if you have any particular needs for your app, feel free to
open an issue or pull request, or simply contact me directly. I'd be happy to
deploy any additional tasks to the live API site as well.

## Cross-Origin Resource Sharing (CORS) Support

Cross-Origin Resource Sharing (CORS) is enabled, if supporting legacy
browsers is not required.

### jQuery Example

```js
$.getJSON('http://api.nusmods.com/2015-2016/1/moduleList.json', function (data) {
  console.log(data);
});
```

## JSONP Support

If supporting legacy browsers is required, JSONP can be used instead.

### jQuery Example

```js
$.getJSON('http://api.nusmods.com/2015-2016/1/moduleList.json?callback=?', function (data) {
  console.log(data);
});
```

If the URL includes the string "callback=?", the request is treated as JSONP.
The server will prepend the JSON data with the callback name to form a valid
JSONP response.

## API Examples

### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/moduleCodes.json

http://api.nusmods.com/2015-2016/1/moduleCodes.json

```js
[
	"ACC1002",
	"ACC1002X",
	"ACC2002",
	...
]
```

### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/moduleList.json

http://api.nusmods.com/2015-2016/1/moduleList.json

```js
{
	"ACC1002": "Financial Accounting",
	"ACC1002X": "Financial Accounting",
	"ACC2002": "Managerial Accounting",
	...
}
```

### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/facultyDepartments.json

http://api.nusmods.com/2015-2016/1/facultyDepartments.json

```js
{
	"ARTS & SOCIAL SCIENCES": [
		"CENTRE FOR LANGUAGE STUDIES",
		"CHINESE STUDIES",
		"COMMUNICATIONS AND NEW MEDIA",
        ...
	],
	"DENTISTRY": [
		"DENTISTRY",
		"DIVISION OF GRADUATE DENTAL STUDIES"
	],
	"DUKE-NUS GRADUATE MEDICAL SCHOOL S'PORE": [
		"DUKE-NUS GRADUATE MEDICAL SCHOOL S'PORE"
	],
	...
}
```

### GET /lessonTypes.json

http://api.nusmods.com/lessonTypes.json

```js
{
	"DESIGN LECTURE": "Tutorial",
	"LABORATORY": "Tutorial",
	"LECTURE": "Lecture",
	"PACKAGED LECTURE": "Lecture",
	"PACKAGED TUTORIAL": "Lecture",
	"RECITATION": "Tutorial",
	"SECTIONAL TEACHING": "Lecture",
	"SEMINAR-STYLE MODULE CLASS": "Lecture",
	"TUTORIAL": "Tutorial",
	"TUTORIAL TYPE 2": "Tutorial",
	"TUTORIAL TYPE 3": "Tutorial"
}
```

### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/modules/&lt;ModuleCode&gt;.json

`ExamDate` and `ExamDuration` are in ISO 8601 formats.

http://api.nusmods.com/2014-2015/2/modules/FE5218.json

```js
{
	"ModuleCode": "FE5218",
	"ModuleTitle": "Credit Risk",
	"Department": "RISK MANAGEMENT INSTITUTE",
	"ModuleDescription": "The course consists of two parts – (i) statistical credit rating models and (ii) credit derivatives. The first part would cover various statistical credit rating models including Altman’s Z-score, logistic regression, artificial neural network and intensity models. The second part will cover various models used to price credit derivative as well as tools used to manage credit risk. The topics covered would include real and risk neutral probability of default, RiskMetricsTM, CreditRisk+, default correlation, Copula, Basket default swap, CDOs etc.",
	"ModuleCredit": "4",
	"Workload": "3-0-0-0-7",
	"Prerequisite": "FE5101: Derivatives and Fixed Income",
	"Corequisite": "FE 5102: Quantitative Methods and Programming",
	"ExamDate": "2013-05-03T19:00+0800",
	"ExamOpenBook": true,
	"ExamDuration": "P2H30M",
	"ExamVenue": "LT31",
	"Timetable": [
		{
			"ClassNo": "SL1",
			"LessonType": "LECTURE",
			"WeekText": "EVERY WEEK",
			"DayText": "WEDNESDAY",
			"StartTime": "1900",
			"EndTime": "2200",
			"Venue": "RMI-SR1"
		}
	]
}
```

### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/modules.json

http://api.nusmods.com/2015-2016/1/modules.json

```js
[
	{
		"ModuleCode": "ACC1002",
		"ModuleTitle": "Financial Accounting",
		"Department": "ACCOUNTING",
		"ModuleDescription": "The course provides an introduction to financial accounting. It examines accounting from an external user's perspective: an external user being an investor or a creditor. Such users would need to understand financial accounting in order to make investing or lending decisions. However, to attain a good understanding, it is also necessary to be familiar with how the information is derived. Therefore, students would learn how to prepare the reports or statements resulting from financial accounting and how to use them for decision-making.",
		"ModuleCredit": "4",
		"Workload": "2-2-0-3-4",
		"Preclusion": "Students who have passed FNA1002 are not allowed to take ACC1002.",
		"ExamDate": "2015-11-25T13:00+0800",
		"Types": [
			"Module"
		],
		"Timetable": [
			{
				"ClassNo": "V1",
				"LessonType": "LECTURE",
				"WeekText": "EVERY WEEK",
				"DayText": "WEDNESDAY",
				"StartTime": "1000",
				"EndTime": "1200",
				"Venue": "LT16"
			},
			...
		]
	},
	{
		"ModuleCode": "ACC1002X",
		"ModuleTitle": "Financial Accounting",
		"Department": "ACCOUNTING",
		"ModuleDescription": "The course provides an introduction to financial accounting. It examines accounting from an external user's perspective: an external user being an investor or a creditor. Such users would need to understand financial accounting in order to make investing or lending decisions. However, to attain a good understanding, it is also necessary to be familiar with how the information are derived. Therefore, students would learn how to prepare the reports or statements resulting from financial accounting and how to use them for decision-making.",
		"ModuleCredit": "4",
		"Preclusion": "Students who have passed CS1304 or EC3212 or BK1003 or BZ1002 or BH1002 or BZ1002E or BH1002E or FNA1002E or FNA1002X are not allowed to take ACC1002X.",
		"ExamDate": "2015-11-25T13:00+0800",
		"Types": [
			"Module",
			"UEM"
		],
		"Timetable": [
			...
		]
	},
	...
]
```

## Initial Setup

Copy `.env.example` to a file named `.env`.

Get an API key from [IVLE](http://ivle.nus.edu.sg/LAPI/default.aspx) and put it in `.env` under `IVLE_API_KEY`.

Download and install [Node.js](http://nodejs.org), [npm](http://npmjs.org), [yarn](https://yarnpkg.com/en/docs/install) and [sqlite3](https://www.sqlite.org/download.html).


Then run the following commands:

```bash
$ yarn # install node dependencies
$ npx knex migrate:latest # set up db tables
$ npx knex seed:run # set up basic information
```

## Updating Module Information

The default gulp task is set to scrape the semester data in the upcoming month. The following commands are valid:

```bash
yarn build:scraper && yarn scrape # production use
yarn scrape:dev # development use
```

Invoking sub-tasks would involve calling the task by changing the commands in `package.json`, or through installing `gulp-cli` globally. For example, to run the `examTimetable` task specifically:

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
    to: 2018,	// year to end parsing
    semesters: [1, 2, 3, 4],	// sem 1, 2 and the 2 special semesters
    config: config.bulletinModules,	// configuration as found in config.js
  });

  const bulletinModules = R.map(tasks.bulletinModules, subtasks);
  return Promise.all(bulletinModules);
});
```

## License

Copyright (c) 2017 NUSModifications. Licensed under the MIT license.
