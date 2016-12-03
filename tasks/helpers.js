'use strict';

var fs = require('graceful-fs');
var path = require('path');
var _ = require('lodash');
var parse5 = require('parse5');
var replay = require('request-replay');
var request = require('request');
const isBinaryPath = require('is-binary-path');
request = request.defaults({jar: true});

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
  var options = _.cloneDeep(options);
  var cachedPath = cachePath(url, options);
  fs.stat(cachedPath, function (statErr, stats) {
    if (!statErr && (options.maxCacheAge === -1 ||
      stats.mtime > Date.now() - options.maxCacheAge * 1000)) {
      fs.readFile(cachedPath, callback);
    } else {
      options.url = url;
      if (!statErr) {
        options.headers = options.headers || {};
        options.headers['if-modified-since'] = (new Date(stats.mtime)).toUTCString();
      }
      const isBinaryFile = isBinaryPath(url);
      if (isBinaryFile) {
        // this makes request return body as a buffer instead of string
        options.encoding = null;
      }
      replay(request(options, function (err, response, body) {
        if (err) {
          return callback(err);
        }
        switch (response.statusCode) {
          case 200:
            if (!isBinaryFile) {
              if (response.headers['content-type'] === 'text/html') {
                // fix html before saving
                const doc = parse5.parse(body);
                body = parse5.serialize(doc);
              }
            }
            fs.writeFile(cachedPath, body, function (err) {
              if (err) {
                console.log('error');
              }
              callback(err, body);
            });
            break;
          case 304:
            fs.readFile(cachedPath, callback);
            break;
          default:
            callback(new Error(response.statusCode + ' while fetching ' + url));
        }
      }), {
        errorCodes: [
          'EADDRINFO',
          'ETIMEDOUT',
          'ECONNRESET',
          'ESOCKETTIMEDOUT',
          'ENOTFOUND',
          'ECONNREFUSED'
        ]
      }).on('replay', function (replay) {
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
