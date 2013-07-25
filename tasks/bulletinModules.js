'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('bulletinModules', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    var path = require('path');
    var querystring = require('querystring');
    var _ = grunt.util._;
    var helpers = require('./helpers');

    helpers.requestCached(options.ivleApi.baseUrl + 'Bulletin_Module_Search?' +
      querystring.stringify({
        APIKey: options.ivleApi.key,
        Semester: options.semester,
        TitleOnly: false
      }), options, function (err, data) {
      if (err) {
        console.log(err);
        return done(false);
      }

      var bulletinModules = JSON.parse(data).Results;
      _.each(_.groupBy(bulletinModules, 'AcadYear'), function (mods, academicYear) {
        grunt.file.write(
          path.join(options.destFolder, academicYear.replace('/', '-'), options.semester, options.destFileName),
          JSON.stringify(mods, null, options.jsonSpace)
        );
      });

      done();
    });
  });
};
