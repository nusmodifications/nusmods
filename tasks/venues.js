'use strict';

module.exports = function (grunt) {
  grunt.registerTask('venues', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    var path = require('path');
    var querystring = require('querystring');
    var helpers = require('./helpers');

    var url = options.venuesApi.baseUrl + 'Dept?' +
      querystring.stringify({
        name: '',
        output: 'json'
      });

    helpers.requestCached(url, options, function (err, data) {
      if (err) {
        console.log(err);
        return done(false);
      }
      var venuesData = JSON.parse(data);
      grunt.file.write(
        path.join(options.destFolder, options.destFileName),
        JSON.stringify(venuesData, null, options.jsonSpace)
      );
    });
  });
};
