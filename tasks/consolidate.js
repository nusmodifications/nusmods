'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('consolidate', function () {
    var options = this.options();

    var path = require('path');
    var _ = require('lodash');
    var helpers = require('./helpers');

    var basePath = path.join(options.srcFolder, options.academicYear.replace('/', '-'), options.semester);
    var bulletinModulesPath = path.join(basePath, grunt.config('bulletinModules').options.destFileName);
    var corsPath = path.join(basePath, grunt.config('cors').options.destFileName);
    var corsBiddingStatsPath = path.join(basePath, grunt.config('corsBiddingStats').options.destFileName);
    var examTimetablePath = path.join(basePath, grunt.config('examTimetable').options.destFileName);
    var moduleTimetableDeltaPath = path.join(basePath, grunt.config('moduleTimetableDelta').options.destFileName);
    var ivlePath = path.join(basePath, grunt.config('ivle').options.destFileName);

    var modules = {};

    if (grunt.file.exists(bulletinModulesPath)) {
      var bulletinModules = grunt.file.readJSON(bulletinModulesPath);
      bulletinModules.forEach(function (mod) {
        modules[mod.ModuleCode] = modules[mod.ModuleCode] || {};
        modules[mod.ModuleCode].Bulletin = mod;
      });
    }

    if (grunt.file.exists(corsPath)) {
      var cors = grunt.file.readJSON(corsPath);

      var corsMods = {};
      cors.forEach(function (mod) {
        var codes = mod.ModuleCode.split(' / ');
        codes.forEach(function (code) {
          corsMods[code] = corsMods[code] || _.omit(mod, 'Type');
          corsMods[code].Types = corsMods[code].Types || {};
          if (/^GE[KM]\d/.test(code)) {
            corsMods[code].Types.GEM = true;
          } else if (/^SS[A-Z]\d/.test(code)) {
            corsMods[code].Types.SSM = true;
          } else if (mod.Type !== 'GEM' && mod.Type !== 'SSM') {
            corsMods[code].Types[mod.Type] = true;
          }
        });
      });
      _.each(corsMods, function (mod, code) {
        mod.Types = Object.keys(mod.Types).sort();
        modules[code] = modules[code] || {};
        modules[code].CORS = mod;
      });
    }

    if (grunt.file.exists(corsBiddingStatsPath)) {
      var corsBiddingStats = grunt.file.readJSON(corsBiddingStatsPath);
      corsBiddingStats.forEach(function (stat) {
        modules[stat.ModuleCode] = modules[stat.ModuleCode] || {};
        modules[stat.ModuleCode].CorsBiddingStats = modules[stat.ModuleCode].CorsBiddingStats || [];
        modules[stat.ModuleCode].CorsBiddingStats.push(stat);
      });
    }

    if (grunt.file.exists(examTimetablePath)) {
      var examTimetable = grunt.file.readJSON(examTimetablePath);
      examTimetable.forEach(function (exam) {
        modules[exam.Code] = modules[exam.Code] || {};
        modules[exam.Code].Exam = exam;
      });
    }

    if (grunt.file.exists(moduleTimetableDeltaPath)) {
      var moduleTimetableDelta = grunt.file.readJSON(moduleTimetableDeltaPath);
      moduleTimetableDelta.forEach(function (delta) {
        modules[delta.ModuleCode] = modules[delta.ModuleCode] || {};
        modules[delta.ModuleCode].TimetableDelta = modules[delta.ModuleCode].TimetableDelta || [];
        modules[delta.ModuleCode].TimetableDelta.push(delta);
      });
    }

    if (grunt.file.exists(ivlePath)) {
      var ivle = grunt.file.readJSON(ivlePath);
      ivle.forEach(function (mod) {
        mod.CourseCode.split('/').forEach(function (code) {
          modules[code] = modules[code] || {};
          modules[code].IVLE = mod;
        });
      });
    }

    modules = _.sortBy(_.values(modules), 'ModuleCode');
    grunt.file.write(
      path.join(basePath, options.destFileName),
      JSON.stringify(modules, null, options.jsonSpace)
    );
  });
};
