'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('cors', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }
    var path = require('path');
    var _ = require('lodash');
    var async = require('async');
    var helpers = require('./helpers');
    var cheerio = require('cheerio');

    _.str = require('underscore.string');
    _.mixin(_.str.exports());

    let academicYear, semester;

    let lessonTypes = {};
    var lessonTypesPath = path.join(options.destFolder, options.destLessonTypes);
    if (grunt.file.exists(lessonTypesPath)) {
      lessonTypes = grunt.file.readJSON(lessonTypesPath);
    }

    async.concatSeries(options.types, (type, callback) => {
      const url = options.baseReportUrl + type + 'InfoListing.jsp';
      helpers.requestCached(url, options, (err, webpage) => {
        if (err) {
          return callback(err);
        }
        const $ = cheerio.load(webpage);
        const listingInfo = $('h2').text().split(':');

        academicYear = listingInfo[1].match(/\d{4}\/\d{4}/).shift();
        semester = listingInfo[2].match(/\d/).shift();

        const listOfModuleInfo = $('tr[valign="top"]').map((i, row) => {
          const hyperlink = $('div > a', row);
          return {
            url: hyperlink.prop('href'),
            moduleCode: hyperlink.html().trim(),
            department: $('td div', row).last().text(),
          };
        }).get();

        async.mapSeries(listOfModuleInfo, (moduleInfo, callback) => {
          const url = options.baseReportUrl + moduleInfo.url;
          helpers.requestCached(url, options, (err, webpage) => {
            if (err) {
              return callback(err);
            }
            const $ = cheerio.load(webpage);

            const timestamp = $('h2').text().match(/Correct as at ([^<]+)/).pop();

            // first table consist of details of the module
            const moduleDetails = $('.tableframe').first().find('tr td:nth-child(2)');
            const module = {
              Type: type,
              ModuleCode: moduleInfo.moduleCode,
              Department: moduleInfo.department,
              CorrectAsAt: timestamp,
              ModuleTitle: moduleDetails.eq(1).text(),
              ModuleDescription: moduleDetails.eq(2).text(),
              ExamDate: moduleDetails.eq(4).text().trim(),
              ModuleCredit: moduleDetails.eq(5).text(),
              Prerequisite: moduleDetails.eq(6).text(),
              Preclusion: moduleDetails.eq(7).text(),
              Workload: moduleDetails.eq(8).text(),
              Timetable: [],
            };

            // get the timetable info
            const timetableTables = $('.tableframe').find('tr table');
            timetableTables.each((i, table) => {
              // remove header and empty rows
              const rows = $('tr', table).slice(1).filter((i, el) => {
                return $('td', el).length > 6;
              });

              // get all the relevant information
              const timetableDetails = rows.map((i, el) => {
                const row = $('td', el);
                return {
                  ClassNo: row.eq(0).text().trim(),
                  LessonType: row.eq(1).text(),
                  WeekText: row.eq(2).text(),
                  DayText: row.eq(3).text(),
                  StartTime: row.eq(4).text(),
                  EndTime: row.eq(5).text(),
                  Venue: row.eq(6).text()
                };
              }).get();

              module.Timetable.push(...timetableDetails);
            });
            callback(null, module);
          });
        }, callback);
      });
    }, (err, results) => {
      if (err) {
        console.log(err);
        return done(false);
      }
      grunt.file.write(
        path.join(options.destFolder, options.destLessonTypes),
        JSON.stringify(helpers.sortByKey(lessonTypes), null, options.jsonSpace)
      );
      grunt.file.write(
        path.join(options.destFolder, academicYear.replace('/', '-'), semester, options.destFileName),
        JSON.stringify(results, null, options.jsonSpace)
      );
      done();
    });
  });
};
