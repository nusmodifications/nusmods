'use strict';

module.exports = function (grunt) {
  grunt.registerTask('corsBiddingStats', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    var path = require('path');
    var _ = require('lodash');
    var async = require('async');
    var helpers = require('./helpers');
    var cheerio = require('cheerio');

    var CORS_URL = 'http://www.nus.edu.sg/cors/';
    var CORS_ARCHIVE_URL = CORS_URL + 'archive.html';
    var biddingSummaryUrlPattern = /Archive\/(\d{4})\d{2}_Sem(\d)\/successbid_(\d[A-F])_\d{4,8}s\d\.html/g;
    var statsKeys = ['Quota', 'Bidders', 'LowestBid', 'LowestSuccessfulBid',
      'HighestBid', 'Faculty', 'StudentAcctType'];

    var biddingStats = [];

    helpers.requestCached(CORS_ARCHIVE_URL, options, function (err, data) {
      if (err) {
        console.log(err);
        return done(false);
      }

      var urls = helpers.matches(biddingSummaryUrlPattern, data);
      async.forEachSeries(urls, function (match, callback) {
        var url = CORS_URL + match[0];

        helpers.requestCached(url, options, function (err, data) {
          if (err) {
            return callback(err);
          }

          var $ = cheerio.load(String(data));
          // some pages have 2 tables, we want the table that is a direct descendant of body
          // this selector get rids of all non-data tr (such as headers)
          // cors should really use th for headers...
          const trs = $('body > table > tr[valign=top]');

          var moduleCode;
          var group;
          var statsArray;

          trs.map((i, tr) => {
            var ps = $('p', tr)

            // there are 2 kinds of rows
            // 1. rows with module code (which has 9 p nodes)
            // 2. rows without belong to a previous row that has a module code (8 p nodes)
            // when we meet row of kind 1, we store the module and group info to be used
            // by rows of type 2 that follows it
            if (ps.length === 9) {
              moduleCode = $(ps[0]).text();
              group = $(ps[1]).text();
            }

            statsArray = ps.slice(ps.length-7).map((i, el) => $(el).text())

            biddingStats.push(_.extend({
              AcadYear: match[1] + '/' + (+match[1] + 1),
              Semester: match[2],
              Round: match[3],
              ModuleCode: moduleCode,
              Group: group,
            }, _.object(statsKeys, statsArray)));
          })

          callback();
        });
      }, function (err) {
        if (err) {
          console.log(err);
          return done(false);
        }

        grunt.file.write(path.join(options.destFolder, options.destFileName),
          JSON.stringify(biddingStats, null, options.jsonSpace));
        _.each(_.groupBy(biddingStats, 'AcadYear'), function (statsForAY, academicYear) {
          _.each(_.groupBy(statsForAY, 'Semester'), function (statsForSem, semester) {
            grunt.file.write(
              path.join(options.destFolder, academicYear.replace('/', '-'), semester, options.destFileName),
              JSON.stringify(statsForSem, null, options.jsonSpace)
            );
          });
        });
        done();
      });
    });
  });
};
