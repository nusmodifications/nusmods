'use strict';

module.exports = function (grunt) {
  grunt.registerTask('moduleTimetableDelta', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    var path = require('path');
    var querystring = require('querystring');
    var _ = require('lodash');
    var helpers = require('./helpers');

    var lastModified = 0;
    var moduleTimetableDelta = [];
    var destPath = path.join(options.destFolder, options.destFileName);
    if (grunt.file.exists(destPath)) {
      moduleTimetableDelta = grunt.file.readJSON(destPath);
      lastModified = parseInt(_.last(moduleTimetableDelta).LastModified.substr(6), 10);
    }

    helpers.requestCached(options.ivleApi.baseUrl + 'Delta_ModuleTimeTable?' +
      querystring.stringify({
        APIKey: options.ivleApi.key,
        LastModified: Math.floor((Date.now() - lastModified) / 1000) - 1
      }), options, function (err, data) {
        if (err) {
          console.log(err);
          return done(false);
        }

        var moduleTimetableDeltaSinceLastModified = JSON.parse(data);

        // If it encounters an exception, IVLE API does not seem to indicate an error via HTTP status codes but still
        // returns data, with a stack trace as the value for ModuleCode and default values for the rest of the fields.
        var elementsWithException = _.where(moduleTimetableDeltaSinceLastModified, {
          LastModified: '/Date(-62135596800000)/'
        });
        if(elementsWithException.length) {
          console.log(elementsWithException);
          return done(false);
        }

        moduleTimetableDelta = moduleTimetableDelta.concat(moduleTimetableDeltaSinceLastModified);
        grunt.file.write(destPath, JSON.stringify(moduleTimetableDelta, null, options.jsonSpace));
        _.each(_.groupBy(moduleTimetableDelta, 'AcadYear'), function (deltaForAY, academicYear) {
          _.each(_.groupBy(deltaForAY, 'Semester'), function (deltaForSem, semester) {
            grunt.file.write(
              path.join(options.destFolder, academicYear.replace('/', '-'), semester, options.destFileName),
              JSON.stringify(deltaForSem, null, options.jsonSpace)
            );
          });
        });

        done();
      });
  });
};
