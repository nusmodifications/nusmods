module.exports = function (grunt) {
  'use strict';

  var querystring = require('querystring');
  var _ = grunt.util._;

  var WISH_BASE = 'https://wish.wis.ntu.edu.sg/webexe/owa/';

  grunt.registerTask('crawlNTU', 'Crawl NTU module information.', function () {
    var done = this.async();

    var options = _.defaults(grunt.config(this.name), {
      academicYear: 2012,
      dest: 'app/json/ntu_module_info.json',
      semester: 2
    });
    if (this.flags.refresh) {
      options.refresh = true;
    }

    var helpers = require('./helpers').init(grunt, options);

    grunt.util.async.parallel({
      classSchedule: function (callback) {
        helpers.getCached(WISH_BASE + 'aus_schedule.main_display?' +
          querystring.stringify({
            acadsem: options.academicYear + ';' + options.semester,
            boption: 'x',
            r_search_type: 'F',
            r_subj_code: 'Enter Keywords or Course Code',
            staff_access: 'false'
          }), function (data) {
          data = /r_course_yr([\s\S]+?)<\/select>/.exec(data)[1];
          var progMatches = helpers.matches(/value=(.+)>(.+)/g, data);

          var classSchedule = {};
          grunt.util.async.forEach(progMatches, function (progMatch, callback) {
            helpers.getCached(
                WISH_BASE + 'AUS_SCHEDULE.main_display1?' +
                    querystring.stringify({
                      acadsem: options.academicYear + ';' + options.semester,
                      boption: 'CLoad',
                      r_course_yr: progMatch[1],
                      r_search_type: 'F',
                      r_subj_code: 'Enter Keywords or Course Code',
                      staff_access: 'false'
                    }),
                function (data) {
                  var tableMatches = helpers.matches(
                      /#0000FF>([^<]+)[\s\S]+?#CAE2EA">([\s\S]+?)<\/TABLE>/g,
                      data);

                  tableMatches.forEach(function (tableMatch) {
                    if (!classSchedule[tableMatch[1]]) {
                      var lessons = [];
                      var tdPattern = /<TD>(?:<B>)?([^<]*)/g;
                      var keys = ['type', 'group', 'day', 'time', 'venue', 'remark'];
                      var indexMatch, index;
                      while (indexMatch = tdPattern.exec(tableMatch[2])) {
                        if (indexMatch[1]) {
                          index = indexMatch[1];
                        }
                        var lesson = {
                          index: index
                        };
                        _.each(keys, function (key) {
                          var value = tdPattern.exec(tableMatch[2])[1];
                          if (value && value !== '&nbsp;') {
                            lesson[key] = value;
                          }
                        });
                        if (_.size(lesson) > 1) {
                          lessons.push(lesson);
                        }
                      }
                      if (lessons.length) {
                        classSchedule[tableMatch[1]] = {
                          lessons: lessons
                        };
                      }
                    }
                  });
                  callback();
                }
            );
          }, function () {
            callback(null, classSchedule);
          });
        });
      },

      contentOfCourses: function (callback) {
        helpers.getCached(WISH_BASE + 'aus_subj_cont.main_display?' +
          querystring.stringify({
            acad: options.academicYear,
            acadsem: options.academicYear + '_' + options.semester,
            boption: '',
            r_course_yr: '',
            r_subj_code: '',
            semester: options.semester
          }), function (data) {
          data = /r_course_yr([\s\S]+?)<\/select>/.exec(data)[1];
          var progMatches = helpers.matches(/value=(.+)>(.+)/g, data);

          var courses = {};
          grunt.util.async.forEach(progMatches, function (progMatch, callback) {
            helpers.getCached(
                WISH_BASE + 'AUS_SUBJ_CONT.main_display1?' +
                    querystring.stringify({
                      acad: options.academicYear,
                      acadsem: options.academicYear + '_' + options.semester,
                      boption: 'CLoad',
                      r_course_yr: progMatch[1],
                      r_subj_code: 'Enter Keywords or Course Code',
                      semester: options.semester
                    }),
                function (data) {
                  var courseMatches = helpers.matches(
                      /F>([^<]+)[\s\S]+?F>([^<]+)[\s\S]+?F>\s*(\d*\.\d)(?: AU)?([\s\S]+?)2>([^<]+)/g,
                      data);
                  courseMatches.forEach(function (courseMatch) {
                    if (!courses[courseMatch[1]]) {
                      courses[courseMatch[1]] = {
                        title: courseMatch[2],
                        academicUnits: +courseMatch[3],
                        description: courseMatch[5].trim(),
                        programmes: []
                      };
                    }
                    courses[courseMatch[1]].programmes.push(progMatch[2]);
                  });
                  callback();
                }
            );
          }, function () {
            callback(null, courses);
          });
        });
      },

      examTimetable: function (callback) {
        helpers.getCached(
            'https://wis.ntu.edu.sg/webexe/owa/exam_timetable_und.get_detail?' +
                querystring.stringify({
                  academic_session:	'Semester ' + options.semester +
                      ' Academic Year ' + options.academicYear + '-' +
                      (options.academicYear + 1),
                  bOption: 'Next',
                  p_dept: '',
                  p_exam_dt: '',
                  p_exam_yr: options.academicYear,
                  p_plan_no: options.semester + 2,
                  p_semester: options.semester,
                  p_start_time: '',
                  p_subj: '',
                  p_venue: ''
                }),
            function (data) {
              var examMatches = helpers.matches(
                  /(\d{1,2} \w+ \d{4})[\s\S]+?(\d)\.(\d{2}) ([ap])(?:.+\n){3}(\w+)\n(?:.+\n){5}([\d.]+)/g,
                  data);

              var examTimetable = {};
              examMatches.forEach(function (m) {
                var date = new Date(m[1] + ' ' +
                    (m[4] === 'a' ? m[2] : +m[2] + 12) + ':' + m[3] + ' GMT');
                examTimetable[m[5]] = {
                  examDateTime: date.toISOString().slice(0, 16) + '+0800',
                  examDuration: +m[6]
                };
              });
              callback(null, examTimetable);
            }
        );
      }
    },
    function (err, results) {
      var sortedResults = {};
      Object.keys(results).sort().forEach(function(key) {
        sortedResults[key] = {};
        Object.keys(results[key]).sort().forEach(function(code) {
          sortedResults[key][code] = results[key][code];
        });
      });
      grunt.file.write(options.dest, JSON.stringify(sortedResults, null, '\t'));
      grunt.log.writeln('File ' + options.dest + ' created.');
      done();
    });
  });
};
