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
headers. They are modular, being written as separate Grunt tasks, so if only a
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

```json
[
	"ACC1002",
	"ACC1002X",
	"ACC2002",
	...
]
```

### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/moduleList.json

http://api.nusmods.com/2015-2016/1/moduleList.json

```json
{
	"ACC1002": "Financial Accounting",
	"ACC1002X": "Financial Accounting",
	"ACC2002": "Managerial Accounting",
	...
}
```

### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/facultyDepartments.json

http://api.nusmods.com/2015-2016/1/facultyDepartments.json

```json
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

```json
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

```json
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

```json
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

[Node.js](http://nodejs.org) and [npm](http://npmjs.org), which
comes with Node.js, are required.

```bash
$ npm install -g grunt-cli
$ npm install
```

## Updating Module Information

```bash
$ grunt
```

The default grunt task is aliased to the `ay2013to2014sem1` task. A few tasks
are set up by default as examples of what can be accomplished by aliasing
tasks.

```js
grunt.registerTask('ay2012to2013sem2', [
  'bulletinModules:semester2',
  'cors:previousSemester',
  'corsBiddingStats',
  'examTimetable:ay2012to2013sem2',
  'ivle:ay2012to2013sem2',
  'moduleTimetableDelta',
  'consolidate:ay2012to2013sem2',
  'normalize:ay2012to2013sem2',
  'split:ay2012to2013sem2',
  'backwardCompatibility:ay2012to2013sem2'
]);

grunt.registerTask('ay2013to2014sem1', [
  'bulletinModules:semester1',
  'cors:currentSemester',
  'examTimetable:ay2013to2014sem1',
  'ivle:ay2013to2014sem1',
  'moduleTimetableDelta',
  'consolidate:ay2013to2014sem1',
  'normalize:ay2013to2014sem1',
  'split:ay2013to2014sem1',
  'backwardCompatibility:ay2013to2014sem1'
]);

grunt.registerTask('ay2013to2014sem2', [
  'bulletinModules:semester2',
  'examTimetable:ay2013to2014sem2',
  'ivle:ay2013to2014sem2',
  'moduleTimetableDelta',
  'consolidate:ay2013to2014sem2',
  'normalize:ay2013to2014sem2',
  'split:ay2013to2014sem2'
]);

grunt.registerTask('ay2013to2014', [
  'ay2013to2014sem1',
  'ay2013to2014sem2'
]);

grunt.registerTask('default', 'ay2013to2014sem1');
```

They may be run by invoking `grunt ay2013to2014`, `grunt ay2013to2014sem1`,
etc. `grunt ay2013to2014sem2` would be equivalent to invoking

```bash
$ grunt bulletinModules:semester2 examTimetable:ay2013to2014sem2 ivle:ay2013to2014sem2 moduleTimetableDelta consolidate:ay2013to2014sem2 normalize:ay2013to2014sem2 split:ay2013to2014sem2
```

## Task Configuration and Targets

Many of the tasks have multiple targets, and can have more defined if necessary.
The `examTimetable` task below has `ay2012to2013sem1` and `ay2013to2014sem1`
targets. Specifying both a task and target like
`grunt examTimetable:ay2013to2014sem1` will process just the specified target's
configuration, while running `grunt examTimetable` will iterate over all
targets, processing each in turn.

```js
grunt.initConfig({
  defaults: {
    cachePath: 'cache',
    // Maximum cache age in seconds. Can be set to 0 to force refresh every
    // time. If set to -1, cached files never expire and are always used.
    maxCacheAge: 6 * 60 * 60,
    destFolder: 'json',
    // Pretty-print JSON with '\t', uglify JSON with ''.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#space_argument
    jsonSpace: '\t'
  },
  ...
  examTimetable: {
    options: {
      cachePath: '<%= defaults.cachePath %>',
      maxCacheAge: '<%= defaults.maxCacheAge %>',
      destFolder: '<%= defaults.destFolder %>',
      jsonSpace: '<%= defaults.jsonSpace %>',
      jquery: 'jquery.min.js',
      destFileName: 'examTimetableRaw.json'
    },
    ay2012to2013sem1: {
      options: {
        maxCacheAge: -1,
        academicYear: '2012/2013',
        semester: '1'
      }
    },
    ay2013to2014sem1: {
      options: {
        academicYear: '2013/2014',
        semester: '1'
      }
    },
    ...
```

Inside a task configuration, an options property may be specified to override
built-in defaults. In addition, each target may have an options property which
is specific to that target. Target-level options will override task-level
options.

In the example above, the `examTimetable` task derives some of its default
options from the `defaults` property above, while `ay2012to2013sem1` overrides
the `maxCacheAge` option to never expire, while `ay2013to2014sem1` would inherit
the default task-level value of 6 hours.

## Force Refreshing Data

The `refresh` flag can be appended to any crawling task to force it to use fresh
data instead of using the cache.

```bash
$ grunt ivle:ay2013to2014sem1:refresh
```

## License

Copyright (c) 2015 NUS Modifications. Licensed under the MIT license.
