module.exports = function(grunt) {
  'use strict';

  var _ = grunt.util._;

  var CORS_BASE = 'https://aces01.nus.edu.sg/cors/jsp/report/';

  grunt.registerTask('crawlNUS', 'Crawl NUS module information.', function() {
    var done = this.async();

    var options = _.defaults(grunt.config(this.name), {
      academicYear: 2012,
      dest: 'app/json/nus_module_info.json',
      semester: 2
    });
    if (this.flags.refresh) {
      options.refresh = true;
    }

    var helpers = require('./helpers').init(grunt, options);

    var lessonTypes = [{}, {}];

    grunt.util.async.series({
      correctAsAt: function(callback) {
        // Get "Correct as at" timestamp from the All Faculty/School/Programme
        // Module Information Listing.
        //
        // Other Module Information Listings have slightly different timestamps,
        // it appears that this one is always updated first. Since it is the
        // most frequently used, it should lessen confusion if others are
        // comparing timestamps between the official and unofficial sources.
        //
        // Check using the "University Administration" faculty sub-listing as it
        // is the smallest to retrieve.
        helpers.get(CORS_BASE + 'ModuleInfoListing.jsp?fac_c=10', function(data) {
          var pattern = /Correct as at ([^<]+)</;
          var match;
          if (match = pattern.exec(data)) {
            var currCorrectAsAt = match[1];

            // If not forcing refresh and previous module information exists,
            // check previous "Correct as at" timestamp.
            if (!options.refresh && grunt.file.exists(options.dest)) {
              var prevCorrectAsAt = grunt.file.readJSON(options.dest).correctAsAt;

              // Force refresh if timestamps differ.
              if (prevCorrectAsAt !== currCorrectAsAt) {
                grunt.log.write('CORS update: ' + prevCorrectAsAt + ' ');
                grunt.log.ok(currCorrectAsAt);
                helpers.setRefresh(true);
              }
            }
            callback(null, currCorrectAsAt);
          } else {
            grunt.warn(pattern + ' not found.');
          }
        });
      },

      examTimetable: function(callback) {
        helpers.getCached(
            'https://webrb.nus.edu.sg/examtt/Exam' + options.academicYear +
                '/Semester ' + options.semester + '/MASTER Sem ' +
                options.semester + ' by Module.html',
            function(data) {
              var examMatches = helpers.matches(
                  />([A-Z]+\d+[A-Z]*)<\/FONT><\/TD>[^<][\s\S]+?(\d{2})\/(\d{2})\/(\d{4})[\s\S]+?(\d):(\d{2})\s+([AP])/g,
                  data);

              var examTimetable = {};
              examMatches.forEach(function(m) {
                var date = new Date(Date.UTC(m[4], +m[3] - 1, m[2],
                    (m[7] === 'A' ? m[5] : +m[5] + 12), m[6]));
                examTimetable[m[1]] = date.toISOString().slice(0, 16) + '+0800';
              });
              callback(null, examTimetable);
            }
        );
      },

      // Map each faculty to its departments. Use Cross-Faculty Module
      // Information Listings as they are the smallest to retrieve.
      facultyDepartments: function(callback) {
        var baseURL = CORS_BASE + 'CFMInfoListing.jsp';
        helpers.getCached(baseURL, function(data) {
          data = /Select a Faculty([\s\S]+?)<\/select>/.exec(data)[1];
          var facMatches = helpers.matches(/value="(\w{2})"\s*>([^<]+)/g, data);

          var facultyDepartments = {};
          grunt.util.async.forEach(facMatches, function(facMatch, callback) {
            helpers.getCached(baseURL + '?fac_c=' + facMatch[1], function(data) {
              data = /Select a Department([\s\S]+?)<\/select>/.exec(data)[1];
              facultyDepartments[facMatch[2]] = helpers.matches(/>(.+)</g, data);
              callback();
            });
          }, function() {
            facultyDepartments['UNIVERSITY ADMINISTRATION'].push('OFFICE OF STUDENT AFFAIRS');
            callback(null, facultyDepartments);
          });
        });
      },

      moduleInformation: function(callback) {
        var moduleInformation = {};
        var types = ['Module', 'GEM', 'SSM', 'UEM', 'CFM'];
        var keys = ['title', 'description', '', 'examDate', 'modularCredits',
          'prerequisite', 'preclusion', 'workload'];

        // Each module may appear under multiple types, with different URLs that
        // have nearly identical content, only one of which needs to be
        // processed. Hence, to take maximum advantage of caching, process types
        // in series so that the order of URLs seen for each module is
        // deterministic.
        grunt.util.async.forEachSeries(types, function(type, callback) {
          helpers.getCached(CORS_BASE + type + 'InfoListing.jsp', function(data) {
            var urlDeptMatches = helpers.matches(
                /(ModuleD.+)">([^<]+)[\s\S]+?> (.*)<\/div>\s*<\/td>\s*<\/?tr/g,
                data);
            grunt.util.async.forEach(urlDeptMatches, function(match, callback) {
              var label = match[2];
              var code = label.split(' ')[0];
              if (moduleInformation[code]) {
                moduleInformation[code].types.push(type);
                callback();
              } else {
                var mod = moduleInformation[code] = {
                  label: label,
                  types: [type],
                  department: match[3],
                  lessons: []
                };
                helpers.getCached(CORS_BASE + match[1], function(data) {
                  var tdPattern = /<td (?:valign=top )?colspan="2">([\s\S]*?)<\/td>/g;
                  var nullPattern = /^(--|n[/.]?a\.?|nil|none\.?|null|No Exam Date\.)$/i;
                  keys.forEach(function (key) {
                    var field = tdPattern.exec(data)[1].trim().replace(/\s+/g, ' ');
                    if (key && !nullPattern.test(field)) {
                      mod[key] = field;
                    }
                  });

                  var tableMatches = helpers.matches(
                      /(?:Lecture|Tutorial) Time Table([\s\S]+?)<\/table>/g,
                      data);

                  tableMatches.forEach(function(tableMatch, index) {
                    var trMatches = helpers.matches(
                        /<tr bgcolor="#[ef]{6}">([\s\S]+?)<\/tr>/g, tableMatch);

                    trMatches.forEach(function(trMatch) {
                      var tdMatches = helpers.matches(/<td>([^<]*)/g, trMatch);

                      if (tdMatches.length > 6) {
                        lessonTypes[index][tdMatches[1]] = true;
                        mod.lessons.push({
                          group: tdMatches[0].trim(),
                          type: tdMatches[1],
                          week: tdMatches[2],
                          day: tdMatches[3],
                          start: ('000' + tdMatches[4]).slice(-4),
                          end: ('000' + tdMatches[5]).slice(-4),
                          room: tdMatches[6].replace(/,$/, '')
                        });
                      }
                    });
                  });
                  callback();
                });
              }
            }, callback);
          });
        }, function() {
          var sortedModuleInformation = {};
          Object.keys(moduleInformation).sort().forEach(function(code) {
            sortedModuleInformation[code] = moduleInformation[code];
          });
          callback(null, sortedModuleInformation);
        });
      }
    }, function(err, results) {
      results.lectureTypes = Object.keys(lessonTypes[0]).sort();
      results.tutorialTypes = Object.keys(lessonTypes[1]).sort();
      grunt.file.write(options.dest, JSON.stringify(results, null, '\t'));
      grunt.log.writeln('File ' + options.dest + ' created.');
      done();
    });
  });
};
