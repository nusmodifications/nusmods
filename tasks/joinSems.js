'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('joinSems', function () {
    var options = this.options();

    var path = require('path');
    var _ = require('lodash');

    var acadYear = options.academicYear;
    var basePath = path.join(options.srcFolder, acadYear.replace('/', '-'));

    var modules = {};

    for (var sem = 1; sem < 5; sem++) {
      var normalizePath = path.join(basePath, sem.toString(), grunt.config('normalize').options.destFileName);
      var normalized = grunt.file.readJSON(normalizePath);
      normalized.forEach(function (mod) {
        mod.AcadYear = acadYear;
        mod.Semester = sem;
        modules[mod.ModuleCode] = modules[mod.ModuleCode] || {};
        modules[mod.ModuleCode][acadYear + sem] = mod;
      });
    }

    var checkDiffKeys = ['ModuleTitle', 'Department',
      'ModuleDescription', 'CrossModule', 'ModuleCredit', 'Workload',
      'Prerequisite', 'Preclusion', 'Corequisite'];

    var semSpecificKeys = ['Semester', 'ExamDate', 'Timetable', 'IVLE',
      'Lecturers', 'LecturePeriods', 'TutorialPeriods'];

    var joined = _.map(modules, function (mods, code) {
      // Just log differences between sems for now. May have to take further
      // action if important data like ModuleCredit changes between sems.
      checkDiffKeys.forEach(function (key) {
        var vals = _.pluck(_.values(mods), key);
        if (vals.slice(1).some(function (val) {return val !== vals[0];})) {
          console.log(code, key, vals);
        }
      });

      var baseMod = mods[acadYear + options.semester];
      var history = [];
      _.each(mods, function (mod) {
        baseMod = baseMod || mod;
        history.push(_.pick(mod, semSpecificKeys));
      });
      baseMod.History = history;

      return _.omit(baseMod, semSpecificKeys);
    });

    grunt.file.write(
      path.join(basePath, grunt.config('normalize').options.destFileName),
      JSON.stringify(_.sortBy(joined, 'ModuleCode'), null, options.jsonSpace)
    );
  });
};
