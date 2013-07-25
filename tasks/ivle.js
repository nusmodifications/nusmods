'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('ivle', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    var path = require('path');
    var querystring = require('querystring');
    var helpers = require('./helpers');

    helpers.requestCached(options.ivleApi.baseUrl + 'Modules_Search?' +
      querystring.stringify({
        APIKey: options.ivleApi.key,
        AcadYear: options.academicYear,
        Semester: 'Semester ' + options.semester,
        IncludeAllInfo: true
      }), options, function (err, data) {
      if (err) {
        console.log(err);
        return done(false);
      }

      var ivle = JSON.parse(data).Results;
      grunt.file.write(
        path.join(options.destFolder, options.academicYear.replace('/', '-'), options.semester, options.destFileName),
        JSON.stringify(ivle, null, options.jsonSpace)
      );

      done();
    });
  });
};
