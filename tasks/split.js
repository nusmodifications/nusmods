'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('split', function () {
    var options = this.options();

    var path = require('path');
    var _ = require('lodash');

    var basePath = path.join(options.srcFolder, options.academicYear.replace('/', '-'), options.semester);
    var normalizePath = path.join(basePath, grunt.config('normalize').options.destFileName);
    var normalized = grunt.file.readJSON(normalizePath);

    var moduleCodes = _.pluck(normalized, 'ModuleCode');
    grunt.file.write(
      path.join(basePath, options.destModuleCodes),
      JSON.stringify(moduleCodes, null, options.jsonSpace)
    );

    var moduleTitles = _.pluck(normalized, 'ModuleTitle');
    grunt.file.write(
      path.join(basePath, options.destModuleList),
      JSON.stringify(_.object(moduleCodes, moduleTitles), null, options.jsonSpace)
    );

    normalized.forEach(function (mod) {
      grunt.file.write(
        path.join(basePath, options.destSubfolder, mod.ModuleCode + '.json'),
        JSON.stringify(mod, null, options.jsonSpace)
      );
    });
  });
};
