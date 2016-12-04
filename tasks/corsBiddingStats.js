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
    var parse5 = require('parse5');

    var CORS_URL = 'http://www.nus.edu.sg/cors/';
    var CORS_ARCHIVE_URL = CORS_URL + 'archive.html';
    var biddingSummaryUrlPattern = /Archive\/(\d{4})\d{2}_Sem(\d)\/successbid_(\d[A-F])_\d{4,8}s\d\.html/g;
    var statsKeys = ['Quota', 'Bidders', 'LowestBid', 'LowestSuccessfulBid',
      'HighestBid', 'Faculty', 'StudentAcctType'];

    var biddingStats = [];

    function findTbody(doc) {
      // BFS to find tbody
      // some pages have 2 tbody, we want the one which is closer to the root
      var q = [doc];
      while (q.length > 0) {
        const node = q.shift()
        if (node.nodeName == 'tbody') {
          return node;
        }
        if (typeof node.childNodes !== 'undefined') {
          q = q.concat(node.childNodes)
        }
      }
      return null;
    }

    function moduleCodeFromTr(tr) {
      return tr.childNodes[1].childNodes[0].childNodes[0].value
    }

    function lessonGroupFromTr(tr) {
      return tr.childNodes[3].childNodes[0].childNodes[0].value
    }

    function getBiddingStatistics(tr) {
      const n = tr.childNodes.length;
      // get the last 7 columns
      const stats = [7, 6, 5, 4, 3, 2, 1].map(
        i => parse5.serialize(tr.childNodes[n-i].childNodes[0]))

      return _.object(statsKeys, stats);
    }

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

          const doc = parse5.parse(String(data));
          const tbody = findTbody(doc)

          var moduleCode;
          var group;

          tbody.childNodes.forEach((cn) => {
            // skip header and random text nodes
            if (cn.nodeName !== 'tr' || cn.attrs.length === 0) {
              return
            }

            const tr = cn;
            // there are 2 kinds of rows
            // 1. rows with module code (which has 12 childNodes)
            // 2. rows without belong to a previous row that has a module code (8 childNodes)
            // when we meet row of kind 1, we store the module and group info to be used
            // by rows of type 2 that follows it
            if (tr.childNodes.length === 12) {
              moduleCode = moduleCodeFromTr(tr);
              group = lessonGroupFromTr(tr);
            }

            biddingStats.push(_.extend({
              AcadYear: match[1] + '/' + (+match[1] + 1),
              Semester: match[2],
              Round: match[3],
              ModuleCode: moduleCode,
              Group: group,
            }, getBiddingStatistics(tr)));
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
