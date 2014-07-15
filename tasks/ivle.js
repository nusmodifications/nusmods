'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('ivle', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    var async = require('async');
    var path = require('path');
    var querystring = require('querystring');
    var helpers = require('./helpers');

    var basePath = path.join(options.srcFolder, options.academicYear.replace('/', '-'), options.semester);
    var bulletinModulesPath = path.join(basePath, grunt.config('bulletinModules').options.destFileName);
    var corsPath = path.join(basePath, grunt.config('cors').options.destFileName);
    var corsBiddingStatsOptions = grunt.config('corsBiddingStats').options;
    var corsBiddingStatsPath = path.join(corsBiddingStatsOptions.destFolder, corsBiddingStatsOptions.destFileName);
    var examTimetablePath = path.join(basePath, grunt.config('examTimetable').options.destFileName);
    var moduleTimetableDeltaPath = path.join(basePath, grunt.config('moduleTimetableDelta').options.destFileName);

    // Get module codes from all preceding tasks
    var moduleCodes = {};
    var populateModuleCodes = function (path, keyOrFunc) {
      if (grunt.file.exists(path)) {
        grunt.file.readJSON(path).forEach(typeof keyOrFunc === 'string' ?
          function (mod) {
            moduleCodes[mod[keyOrFunc]] = true;
          } : keyOrFunc);
      }
    };
    populateModuleCodes(bulletinModulesPath, 'ModuleCode');
    populateModuleCodes(corsPath, function (mod) {
      mod.ModuleCode.split(' / ').forEach(function (code) {
        moduleCodes[code] = true;
      });
    });
    populateModuleCodes(corsBiddingStatsPath, 'ModuleCode');
    populateModuleCodes(examTimetablePath, 'Code');
    populateModuleCodes(moduleTimetableDeltaPath, 'ModuleCode');

    async.mapLimit(Object.keys(moduleCodes), options.concurrencyLimit, function (moduleCode, callback) {
      var url = options.ivleApi.baseUrl + 'Modules_Search?' +
        querystring.stringify({
          APIKey: options.ivleApi.key,
          AcadYear: options.academicYear,
          IncludeAllInfo: true,
          ModuleCode: moduleCode,
          Semester: 'Semester ' + options.semester,
          AuthToken: options.ivleApi.token
        });
      helpers.requestCached(url, options, function (err, data) {
        if (err) {
          return callback(err);
        }

        callback(null, JSON.parse(data).Results.filter(function (result) {
          return result.CourseCode === moduleCode;
        }));
      });
    }, function (err, results) {
      if (err) {
        console.log(err);
        return done(false);
      }

      grunt.file.write(
        path.join(options.destFolder, options.academicYear.replace('/', '-'), options.semester, options.destFileName),
        JSON.stringify(results.filter(function (result) {
          return result.length;
        }), null, options.jsonSpace)
      );
      done();
    });
  });
};
