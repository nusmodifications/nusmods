'use strict';

function parseExamPdf(fileData) {
  const pdfjs = require('pdfjs-dist');
  const moment = require('moment');
  const _ = require('lodash');

  const fileArray = new Uint8Array(fileData);
  return pdfjs.getDocument(fileArray)
    .then((pdfDocument) => {
      // get all the pages from pdf
      const numPages = pdfDocument.numPages;
      return Promise.all(_.range(1, numPages + 1).map((pageNum) => {
        return pdfDocument.getPage(pageNum);
      }));
    })
    .then((pages) => {
      // get text content items from all pages
      return Promise.all(pages.map((page) => {
        return page.getTextContent().then((content) => {
          // remove headers and page number
          return content.items.slice(17, -1);
        });
      }));
    })
    .then((items) => {
      let strings = _.flatten(items).map(item => item.str.trim());
      // remove '' and pdf title, then reverse for easier processing
      strings = _.compact(strings.map(item => item)).reverse();
      // parse into array of array of modules strings
      const modulesArr = _.reduce(strings, (result, val) => {
        if (val === 'AM' || val === 'PM') {
          // create new module
          result.push([]);
        }
        // remove any whitespace seperators
        const values = val.split(/\s+/).reverse();
        result[result.length - 1].push(...values);
        return result;
      }, []);

      const moduleExams = modulesArr.map((moduleArr) => {
        const moduleString = moduleArr.reverse().join('');
        // first 21 chars contain the date and time
        const dateTime = moduleString.substr(-21).split(')');
        // only keep numerics
        const date = dateTime[0].replace(/\D/g, '');
        const time = dateTime[1];

        // remove last 8 that contains date and time that we have already parsed
        moduleArr.splice(-8, 8);
        // faculty is index 0
        const faculty = moduleArr.shift();
        // module code and first word of module title are joined by whitespace
        const joinedCodeAndWord = moduleArr.slice(0, 1).join('').split(/\s+/);
        // remove module code and replace it with first word of module title
        const code = joinedCodeAndWord[0];
        moduleArr[0] = joinedCodeAndWord[1];
        const title = moduleArr.join(' ').trim();

        if (!moment(date, 'DDMMYYYY',true).isValid()) {
          throw new Error(`Module ${code}'s date format is wrong: ${date}`);
        }
        return {
          'Date': date,
          'Time': time,
          'Faculty': faculty,
          'Code': code,
          'Title': title,
        };
      });

      return moduleExams;
    });
}

module.exports = function (grunt) {
  grunt.registerMultiTask('examTimetable', function () {
    const done = this.async();
    const options = this.options();
    console.log(options);
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    const path = require('path');
    const helpers = require('./helpers');

    const year = options.academicYear.slice(0, 4);
    const semester = options.semester;
    const root = 'https://webrb.nus.edu.sg/examtt';
    const url = `${root}/Exam${year}/Semester ${semester}/Semester_${semester}_by_Module.pdf`;

    helpers.requestCached(url, options, (err, data) => {
      if (err) {
        console.log(err);
        return done(false);
      }
      parseExamPdf(data).then((moduleExams) => {
        const pathToWrite = path.join(
          options.destFolder,
          options.academicYear.replace('/', '-'),
          semester,
          options.destFileName
        );
        grunt.file.write(
          pathToWrite,
          JSON.stringify(moduleExams, null, options.jsonSpace)
        );
        done();
      }).catch((err) => {
        console.log(err);
      });
    });
  });
};
