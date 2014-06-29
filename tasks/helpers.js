// Helpers to make http requests with caching
exports.init = function (grunt, options) {
  'use strict';

  var fs = require('fs');
  var http = require('http');
  var https = require('https');
  var path = require('path');
  var url = require('url');

  var protocol = {
    'http:': http,
    'https:': https
  };

  options = grunt.util._.defaults(options, {
    cachePath: 'cache',
    maxCacheAge: 24 * 60 * 60, // in seconds
    maxConcurrentFiles: 64,
    maxConcurrentSockets: 8,
    refresh: false
  });

  http.globalAgent.maxSockets = options.maxConcurrentSockets;
  https.globalAgent.maxSockets = options.maxConcurrentSockets;

  // Create cache directory along with any intermediate directories.
  grunt.file.mkdir(options.cachePath);

  // Convert URL to equivalent valid filename.
  var cachePath = function (urlStr) {
    // Add .html extension to URL if not already .html, to facilitate easier
    // opening of cached files in browsers.
    if (urlStr.slice(-5) !== '.html') {
      urlStr += '.html';
    }

    urlStr = encodeURIComponent(urlStr);

    // Truncate filename to 255 bytes if longer. Suffices to distinguish
    // cached files so far as only unnecessary URL parameters are being
    // truncated. May need more robust mapping in the future.
    if (urlStr.length > 255) {
      urlStr = urlStr.substr(0, 250) + '.html';
    }

    return path.join(options.cachePath, urlStr);
  };

  var queue = grunt.util.async.queue(function (filename, callback) {
    fs.readFile(filename, 'utf8', function (err, data) {
      if (err) {
        grunt.warn(err + ' while reading ' + filename + '.');
      }
      callback(data);
    });
  }, options.maxConcurrentFiles);

  var exports = {};

  exports.get = function (urlStr, callback) {
    var urlObj = url.parse(urlStr);
    protocol[urlObj.protocol].get(urlObj,function (res) {
      var data;
      if (res.statusCode === 200) {
        data = '';
        res.on('data', function (chunk) {
          data += chunk;
        });
        res.on('end', function () {
          callback(data);
        });
        res.pipe(fs.createWriteStream(cachePath(urlStr)));
      } else {
        grunt.log.error(res.statusCode + ' while getting ' + urlStr + '.');
        exports.get(urlStr, callback);
      }
    }).on('error', function (err) {
      grunt.warn(err + ' while getting ' + urlStr + '.');
    });
  };

  exports.getCached = function (urlStr, callback) {
    if (options.refresh) {
      exports.get(urlStr, callback);
    } else {
      var cachedPath = cachePath(urlStr);
      fs.stat(cachedPath, function (err, stats) {
        if (!err && stats.mtime > Date.now() - options.maxCacheAge * 1000) {
          queue.push(cachedPath, callback);
        } else {
          exports.get(urlStr, callback);
        }
      });
    }
  };

  exports.setRefresh = function (refresh) {
    options.refresh = refresh;
  };

  // Match regex pattern against data. If there is only one capturing group in
  // pattern, return array with only that group, otherwise return all groups.
  exports.matches = function (pattern, data) {
    var matches = [];
    var match;
    while(match = pattern.exec(data)) {
      matches.push(match[2] === undefined? match[1] : match);
    }
    return matches;
  };

  return exports;
};
