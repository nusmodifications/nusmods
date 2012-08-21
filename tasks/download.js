module.exports = function(grunt) {
  var fs = require('fs'),
      http = require('http'),
      https = require('http'),
      url = require('url'),
      zlib = require('zlib');

  var protocol = {'http:': http, 'https:': https};

  grunt.registerMultiTask('download', 'Download files.', function() {
    var done = this.async(),
        src = this.file.src,
        dest = this.file.dest,
        options = url.parse(this.file.src);
        options.headers = {'accept-encoding': 'gzip,deflate'};
    fs.stat(dest, function(err, stats) {
      if(!err) options.headers['If-Modified-Since'] = stats.mtime.toUTCString();
      protocol[options.protocol].get(options, function(res) {
        if(res.statusCode == 200) {
          grunt.log.writeln(src + ' last modified ' +
                            new Date(res.headers['last-modified']) + '.');
          var output = fs.createWriteStream(dest);
          switch (res.headers['content-encoding']) {
            case 'gzip':
              res.pipe(zlib.createGunzip()).pipe(output);
              break;
            case 'deflate':
              res.pipe(zlib.createInflate()).pipe(output);
              break;
            default:
              res.pipe(output);
              break;
          }
          output.on('close', function() {
            grunt.log.writeln('File "' + dest + '" downloaded.');
            done();
          });
        }
        else if(res.statusCode == 304) {
          grunt.log.writeln(src + ' not modified since ' + stats.mtime + '.');
          done();
        }
        else {
          grunt.log.error(res.statusCode + ' while getting ' + src + '.');
          done(!err); // Do not fail task if file exists.
        }
      }).on('error', function(e) {
        grunt.log.error(e + ' while getting ' + src + '.');
        done(!err); // Do not fail task if file exists.
      });
    });
  });
};