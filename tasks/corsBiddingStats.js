'use strict';

module.exports = function (grunt) {
  grunt.registerTask('corsBiddingStats', function () {
    var done = this.async();
    var options = this.options();
    if (this.flags.refresh) {
      options.maxCacheAge = 0;
    }

    var path = require('path');
    var _ = grunt.util._;
    var async = grunt.util.async;
    var helpers = require('./helpers');

    var CORS_URL = 'http://www.nus.edu.sg/cors/';
    var CORS_ARCHIVE_URL = CORS_URL + 'archive.html';
    var biddingSummaryUrlPattern = /Archive\/(\d{4})\d{2}_Sem(\d)\/successbid_(\d[A-F])_\d{4,8}s\d\.html/g;
    var moduleGroupStatsPattern = /td><p>([^<]+).+\r\n.+p>([^<]+).+\r\n(.+)/g;
    var cellPattern = /<p>(.+?)<\/p>/g;
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

          var moduleGroupStats = helpers.matches(moduleGroupStatsPattern, data);
          moduleGroupStats.forEach(function (moduleGroupStat) {
            var statCells = helpers.matches(cellPattern, moduleGroupStat[3]);
            while (statCells.length) {
              biddingStats.push(_.extend({
                AcadYear: match[1] + '/' + (+match[1] + 1),
                Semester: match[2],
                Round: match[3],
                ModuleCode: moduleGroupStat[1],
                Group: moduleGroupStat[2]
              }, _.object(statsKeys, statCells.splice(0, 7))));
            }
          });

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
