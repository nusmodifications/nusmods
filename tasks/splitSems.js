'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('splitSems', function () {
    var options = this.options();

    var path = require('path');
    var _ = require('lodash');

    var acadYear = options.academicYear;
    var basePath = path.join(options.srcFolder, acadYear.replace('/', '-'));
    var joinedSemPath = path.join(basePath, grunt.config('normalize').options.destFileName);
    var modules = grunt.file.readJSON(joinedSemPath);

    var moduleList = [];
    var moduleInformation = [];

    modules.forEach(function (mod) {
      moduleList.push(_.pick(mod, [
        'ModuleCode',
        'ModuleTitle',
        'Semesters'
      ]));

      var info = _.pick(mod, [
        'ModuleCode',
        'ModuleTitle',
        'Department',
        'ModuleDescription',
        'CrossModule',
        'ModuleCredit',
        'Workload',
        'Prerequisite',
        'Preclusion',
        'Corequisite',
        'Types',
        'History'
      ]);
      grunt.file.write(
        path.join(basePath, grunt.config('split').options.destSubfolder, mod.ModuleCode, 'index.json'),
        JSON.stringify(info, null, options.jsonSpace)
      );
      moduleInformation.push(info);
    });

    grunt.file.write(
      path.join(basePath, grunt.config('split').options.destModuleList),
      JSON.stringify(moduleList, null, options.jsonSpace)
    );
    grunt.file.write(
      path.join(basePath, grunt.config('split').options.destModuleInformation),
      JSON.stringify(moduleInformation, null, options.jsonSpace)
    );
  });
};
