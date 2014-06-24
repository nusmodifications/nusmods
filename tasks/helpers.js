'use strict';

var fs = require('graceful-fs');
var path = require('path');
var replay = require('request-replay');
var request = require('request');

// Convert URL to equivalent valid filename.
var cachePath = function (urlStr, options) {
  var extension = path.extname(urlStr);
  urlStr = encodeURIComponent(urlStr);

  // Truncate filename to 255 bytes if longer. Suffices to distinguish
  // cached files so far as only unnecessary URL parameters are being
  // truncated. May need more robust mapping in the future.
  if (urlStr.length > 255) {
    urlStr = urlStr.substr(0, 255 - extension.length) + extension;
  }

  return path.join(options.cachePath, urlStr);
};

exports.requestCached = function (url, options, callback) {
  var cachedPath = cachePath(url, options);
  fs.stat(cachedPath, function (statErr, stats) {
    if (!statErr && (options.maxCacheAge === -1 ||
      stats.mtime > Date.now() - options.maxCacheAge * 1000)) {
      fs.readFile(cachedPath, 'utf8', callback);
    } else {
      options.url = url;
      if (!statErr) {
        options.headers = options.headers || {};
        options.headers['if-modified-since'] = (new Date(stats.mtime)).toUTCString();
      }
      replay(request(options, function (err, response, body) {
        if (err) {
          callback(err);
        }
        switch (response.statusCode) {
          case 200:
            fs.writeFile(cachedPath, body, function (err) {
              callback(err, body);
            });
            break;
          case 304:
            fs.readFile(cachedPath, 'utf8', callback);
            break;
          default:
            callback(new Error(response.statusCode + ' while fetching ' + url));
        }
      })).on('replay', function (replay) {
        console.log('request failed: ' + replay.error.code + ' ' + replay.error.message);
        console.log('replay nr: #' + replay.number);
        console.log('will retry in: ' + replay.delay + 'ms');
      });
    }
  });
};

// Match regex pattern against data. If there is only one capturing group in
// pattern, return array with only that group, otherwise return all groups.
exports.matches = function (pattern, data) {
  var matches = [];
  var match;
  while (match = pattern.exec(data)) {
    matches.push(match[2] === undefined ? match[1] : match);
  }
  return matches;
};

exports.sortByKey = function (object) {
  var sortedObject = {};
  Object.keys(object).sort().forEach(function (key) {
    sortedObject[key] = object[key];
  });
  return sortedObject;
};
