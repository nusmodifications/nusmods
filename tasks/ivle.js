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

    var consolidateOptions = grunt.config('consolidate').options;
    var basePath = path.join(consolidateOptions.srcFolder, options.academicYear.replace('/', '-'), options.semester);
    var consolidatePath = path.join(basePath, consolidateOptions.destFileName);
    var consolidated = grunt.file.readJSON(consolidatePath);

    async.mapLimit(consolidated, options.concurrencyLimit, function (rawMod, callback) {
      var url = options.ivleApi.baseUrl + 'Modules_Search?' +
        querystring.stringify({
          APIKey: options.ivleApi.key,
          AcadYear: options.academicYear,
          IncludeAllInfo: true,
          ModuleCode: rawMod.ModuleCode,
          Semester: 'Semester ' + options.semester,
          AuthToken: options.ivleApi.token
        });
      helpers.requestCached(url, options, function (err, data) {
        if (err) {
          return callback(err);
        }

        rawMod.IVLE = JSON.parse(data).Results.filter(function (result) {
          return result.CourseCode === rawMod.ModuleCode;
        });
        grunt.file.write(
          path.join(options.destFolder, options.academicYear.replace('/', '-'),
            options.semester, options.destSubfolder, rawMod.ModuleCode + '.json'),
          JSON.stringify(rawMod.IVLE, null, options.jsonSpace)
        );
        callback(null, rawMod);
      });
    }, function (err, results) {
      if (err) {
        console.log(err);
        return done(false);
      }

      grunt.file.write(
        consolidatePath,
        JSON.stringify(results, null, options.jsonSpace)
      );

      done();
    });
  });
};
