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

    _.str = require('underscore.string');
    _.mixin(_.str.exports());

    var keys = ['ModuleTitle', 'ModuleDescription', '', 'ExamDate',
      'ModuleCredit', 'Prerequisite', 'Preclusion', 'Workload'];

    var academicYear, semester;

    var lessonTypes = {};
    var lessonTypesPath = path.join(options.destFolder, options.destLessonTypes);
    if (grunt.file.exists(lessonTypesPath)) {
      lessonTypes = grunt.file.readJSON(lessonTypesPath);
    }

    async.concatSeries(options.types, function (type, callback) {
      var url = options.baseUrl + type + 'InfoListing.jsp';
      helpers.requestCached(url, options, function (err, data) {
        if (err) {
          return callback(err);
        }

        var academicYearSemesterPattern = /Academic Year : (\d{4}\/\d{4}) Semester : (1|2|3|4)/;
        var match = academicYearSemesterPattern.exec(data);
        academicYear = match[1];
        semester = match[2];

        var urlDeptPattern = /(ModuleD.+)">([^<]+)[\s\S]+?> (.*)<\/div>\s*<\/td>\s*<\/?tr/g;
        var urlDeptMatches = helpers.matches(urlDeptPattern, data);
        async.mapSeries(urlDeptMatches, function (match, callback) {
          helpers.requestCached(options.baseUrl + match[1], options, function (err, data) {
            if (err) {
              return callback(err);
            }

            var mod = {
              Type: type,
              ModuleCode: match[2],
              Department: match[3],
              CorrectAsAt: /Correct as at ([^<]+)</.exec(data)[1]
            };

            var tdPattern = /<td (?:valign=top )?colspan="2">([\s\S]*?)(?:<br>\s*)?<\/td>/g;
            keys.forEach(function (key) {
              var field = _.clean(tdPattern.exec(data)[1]);
              if (key) {
                mod[key] = field;
              }
            });

            mod.Timetable = [];
            var tableMatches = helpers.matches(
              /(Lecture|Tutorial) Time Table([\s\S]+?)^<\/table>/gm,
              data);
            tableMatches.forEach(function (tableMatch) {
              var trMatches = helpers.matches(
                /<tr bgcolor="#[ef]{6}">([\s\S]+?)<\/tr>/g, tableMatch[2]);

              trMatches.forEach(function (trMatch) {
                var tdMatches = helpers.matches(/<td>([^<]*)/g, trMatch);

                if (tdMatches.length > 6) {
                  lessonTypes[tdMatches[1]] = tableMatch[1];
                  mod.Timetable.push({
                    ClassNo: tdMatches[0].trim(),
                    LessonType: tdMatches[1],
                    WeekText: tdMatches[2],
                    DayText: tdMatches[3],
                    StartTime: tdMatches[4],
                    EndTime: tdMatches[5],
                    Venue: tdMatches[6]
                  });
                }
              });
            });

            callback(null, mod);
          });
        }, callback);
      });
    }, function (err, results) {
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
