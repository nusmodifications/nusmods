# NUSMods API - Data Server

https://api.nusmods.com

The NUSMods API data server serves various bits of NUS-related information
consolidated from official sources by [our
scraper](../../scrapers/nus).

We will be transitioning from a REST API data server to a GraphQL data server
soon, and this project contains the code which implements this new server. Note
that this project only documents and does not implement our REST API, because
our REST API is just a bunch of static files served by Nginx.

## GraphQL API

As our new GraphQL APIs are still being worked on, have not been finalized and
is not live, there are no detailed docs for it. You are still welcome to browse
through the code and schema.

### Initial Setup

1. Download and install [Node.js](https://nodejs.org), [npm](https://npmjs.org)
   and [yarn](https://yarnpkg.com/en/docs/install).
1. Run the scraper, or copy the scraped data into `<nusmods>/api/data/nus`.
1. Run the following commands in a terminal:

    ```bash
    $ yarn # install node dependencies
    $ yarn start # start the GraphQL server
    ```

#### Incomplete scraper set up (optional)

There is an incomplete (and unused) scraper implementation present in this
project as well. It is intended to replace the existing scrapers at some point,
and save all scraped data straight to a SQLite database instead of saving to
static files.

Currently, it is incomplete and can't do anything useful, but this is how to
set it up if you want to work on it.

1. Copy `.env.example` to a file named `.env`.

1. Download and install [sqlite3](https://www.sqlite.org/download.html).

1. Run the following commands in a terminal:
    ```bash
    $ npx knex migrate:latest # set up db tables
    $ npx knex seed:run # set up basic information
    ```

## REST API

This is a purely JSON API, with CORS and JSONP support, and is statically
generated - since the module information changes a few times a day at most,
this allows the API to be as fast as possible, and be completely browsable at
https://api.nusmods.com.

The raw and intermediate processed JSON are also available, in addition to the
fully processed and normalized JSON. JSON property names are UpperCamelCase and
match the equivalent IVLE API property names where possible to adhere to the
principle of least astonishment.

### Cross-Origin Resource Sharing (CORS) Support

Cross-Origin Resource Sharing (CORS) is enabled, if supporting legacy
browsers is not required.

#### jQuery Example

```js
$.getJSON('https://api.nusmods.com/2015-2016/1/moduleList.json', function(data) {
  console.log(data);
});
```

### JSONP Support

If supporting legacy browsers is required, JSONP can be used instead.

#### jQuery Example

```js
$.getJSON(
  'https://api.nusmods.com/2015-2016/1/moduleList.json?callback=?',
  function(data) {
    console.log(data);
  },
);
```

If the URL includes the string "callback=?", the request is treated as JSONP.
The server will prepend the JSON data with the callback name to form a valid
JSONP response.

### API Examples

#### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/moduleCodes.json

https://api.nusmods.com/2015-2016/1/moduleCodes.json

```js
[
  "ACC1002",
  "ACC1002X",
  "ACC2002",
  ...
]
```

#### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/moduleList.json

https://api.nusmods.com/2015-2016/1/moduleList.json

```js
{
  "ACC1002": "Financial Accounting",
  "ACC1002X": "Financial Accounting",
  "ACC2002": "Managerial Accounting",
  ...
}
```

#### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/facultyDepartments.json

https://api.nusmods.com/2015-2016/1/facultyDepartments.json

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

#### GET /lessonTypes.json

https://api.nusmods.com/lessonTypes.json

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

#### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/modules/&lt;ModuleCode&gt;.json

`ExamDate` and `ExamDuration` are in ISO 8601 formats.

https://api.nusmods.com/2014-2015/2/modules/FE5218.json

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

#### GET /&lt;AcadYear&gt;/&lt;Semester&gt;/modules.json

https://api.nusmods.com/2015-2016/1/modules.json

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
