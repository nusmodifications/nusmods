'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('normalize', function () {
    var options = this.options();

    var path = require('path');
    var _ = grunt.util._;
    var moment = require('moment');
    var helpers = require('./helpers');

    var basePath = path.join(options.srcFolder, options.academicYear.replace('/', '-'), options.semester);
    var consolidatePath = path.join(basePath, grunt.config('consolidate').options.destFileName);
    var consolidated = grunt.file.readJSON(consolidatePath);

    var nullPattern = /^(--|n[/.]?a\.?|nil|none\.?|null|No Exam Date\.|)$/i;

    var facultyDepartments = {};

    var modules = _.compact(_.map(consolidated, function (rawMod) {
      var modInfo = rawMod.Bulletin || rawMod.CORS;
      if (modInfo) {
        var mod = _.pick(modInfo, 'ModuleCode', 'ModuleTitle', 'Department',
          'ModuleDescription', 'CrossModule', 'ModuleCredit', 'Workload',
          'Prerequisite', 'Preclusion', 'Corequisite');
        _.each(mod, function (value, key) {
          value = mod[key] = _.clean(value);
          if (nullPattern.test(value)) {
            delete mod[key];
          }
        });

        if (rawMod.Bulletin) {
          facultyDepartments[modInfo.Faculty] = facultyDepartments[modInfo.Faculty] || {};
          facultyDepartments[modInfo.Faculty][modInfo.Department] = true;
        }

        var exam = rawMod.Exam;
        if (exam) {
          mod.ExamDate = moment.utc(exam.Date.slice(0, 11) + exam.Time,
            'DD/MM/YYYY h:mm a').toISOString().slice(0, 16) + '+0800';
          if (exam[''] === '*') {
            mod.ExamOpenBook = true;
          }
          if (exam.Duration) {
            mod.ExamDuration = 'P' + exam.Duration.replace(/\s/g, '').toUpperCase().slice(0, 5);
          }
          if (exam.Venue) {
            mod.ExamVenue = exam.Venue;
          }
        } else if (rawMod.CORS) {
          exam = rawMod.CORS.ExamDate;
          if (exam !== 'No Exam Date.') {
            var dateTime = rawMod.CORS.ExamDate.split(' ');
            var date = moment.utc('29-04-2013', 'DD-MM-YYYY');
            switch (dateTime[1]) {
              case 'AM':
                date.hour(9);
                break;
              case 'PM':
                // 2.30 PM on Friday afternoons
                if (date.day() === 5) {
                  date.hour(14).minute(30);
                } else {
                  date.hour(13);
                }
                break;
              case 'EVENING':
                date.hour(17);
                break;
              default:
                grunt.fail.warn('Unexpected exam time ' + dateTime[1]);
            }
            mod.ExamDate = date.toISOString().slice(0, 16) + '+0800';
          }
        }

        if (rawMod.CORS) {
          mod.Types = rawMod.CORS.Types;
        }

        if (rawMod.IVLE) {
          mod.Lecturers = _.compact(rawMod.IVLE.Lecturers.map(function (lecturer) {
            switch (lecturer.Role.trim()) {
              case 'Lecturer':
              case 'Co-Lecturer':
              case 'Visiting Professor':
                return lecturer.User.Name;
            }
          }));
        }

        _.each(rawMod.TimetableDelta, function (delta) {
          // Ignore Sundays - they seem to be dummy values.
          if (delta.DayCode === '7') {
            return;
          }

          var isDelete = delta.isDelete;
          delta = _.pick(delta, 'ClassNo', 'LessonType', 'WeekText', 'DayCode',
            'DayText', 'StartTime', 'EndTime', 'Venue');

          var timetable = mod.Timetable = mod.Timetable || [];
          var originalLength = timetable.length;
          for (var i = 0; i < timetable.length; i++) {
            if (_.isEqual(timetable[i], delta)) {
              timetable.splice(i--, 1);
            }
          }
          var lessonsDeleted = originalLength - timetable.length;
          if (isDelete) {
            if (lessonsDeleted !== 1) {
              grunt.verbose.writeln(lessonsDeleted + ' lessons deleted for ' + modInfo.ModuleCode);
            }
            if (timetable.length === 0) {
              grunt.verbose.writeln('No more lessons for ' + modInfo.ModuleCode);
              delete mod.Timetable;
            }
          } else {
            if (lessonsDeleted > 0) {
              grunt.verbose.writeln('Duplicate lesson deleted for ' + modInfo.ModuleCode);
            }
            timetable.push(delta);
          }
        });

        if (mod.Timetable) {
          mod.Timetable.forEach(function (lesson) {
            lesson.DayText = lesson.DayText.toUpperCase();
            lesson.StartTime = ('000' + lesson.StartTime).slice(-4);
            lesson.EndTime = ('000' + lesson.EndTime).slice(-4);
            lesson.Venue = lesson.Venue.trim();
          });

          var lessonSortOrder = ['LessonType', 'ClassNo', 'DayCode', 'StartTime',
            'EndTime', 'WeekText', 'Venue'];
          mod.Timetable.sort(function (a, b) {
            for (var i = 0; i < lessonSortOrder.length; i++) {
              var key = lessonSortOrder[i];
              if (a[key] !== b[key]) {
                return a[key] > b[key] ? 1 : -1;
              }
            }
            return 0;
          });

          mod.Timetable.forEach(function (lesson) {
            delete lesson.DayCode;
          });
        }

        return mod;
      }
    }));

    _.each(facultyDepartments, function (departments, faculty) {
      facultyDepartments[faculty] = Object.keys(departments).sort();
    });
    grunt.file.write(
      path.join(basePath, options.destFacultyDepartments),
      JSON.stringify(helpers.sortByKey(facultyDepartments), null, options.jsonSpace)
    );

    grunt.file.write(
      path.join(basePath, options.destFileName),
      JSON.stringify(modules, null, options.jsonSpace)
    );
  });
};
