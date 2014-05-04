'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('examTimetable', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    var path = require('path');
    var _ = require('lodash');
    var jsdom = require("jsdom");
    var helpers = require('./helpers');

    _.str = require('underscore.string');
    _.mixin(_.str.exports());

    helpers.requestCached('https://webrb.nus.edu.sg/examtt/Exam' + options.academicYear.slice(0, 4) +
      '/Semester ' + options.semester + '/MASTER Sem ' +
      options.semester + ' by Module.html', options, function (err, data) {
      if (err) {
        console.log(err);
        return done(false);
      }

      jsdom.env({
        html: data,
        src: grunt.file.read(options.jquery),
        done: function (err, window) {
          if (err) {
            console.log(err);
            return done(false);
          }

          var $ = window.$;

          var rows = $('table').first().find('tr');

          var headers = rows.first().find('td, th').map(function () {
            return $(this).text().trim();
          }).get();

          var output = rows.slice(1)
            .filter(function () {
              return $(this).text().trim().length;
            })
            .map(function () {
              return _.object(headers, $(this).find('td').map(function () {
                return _.clean($(this).text());
              }).get());
            })
            .get();

          grunt.file.write(
            path.join(options.destFolder, options.academicYear.replace('/', '-'), options.semester, options.destFileName),
            JSON.stringify(output, null, options.jsonSpace)
          );
          done();
        }
      });
    });
  });
};
