'use strict';

module.exports = function (grunt) {
  // Generates JSON backward-compatible with the pubically available
  // mod_info.json from NUSMods, which has been used for a few projects.
  grunt.registerMultiTask('backwardCompatibility', function () {
    var options = this.options();

    var path = require('path');
    var _ = require('lodash');

    var basePath = path.join(options.srcFolder, options.academicYear.replace('/', '-'), options.semester);
    var normalizePath = path.join(basePath, grunt.config('normalize').options.destFileName);
    var normalized = grunt.file.readJSON(normalizePath);
    var facultyDepartmentsPath = path.join(basePath, grunt.config('normalize').options.destFacultyDepartments);
    var facultyDepartments = grunt.file.readJSON(facultyDepartmentsPath);
    var lessonTypesPath = path.join(basePath, grunt.config('cors').options.destLessonTypes);
    var lessonTypes = grunt.file.readJSON(lessonTypesPath);

    var mod_info = {
      departments: facultyDepartments,
      cors: {}
    };

    var cors = mod_info.cors;
    _.each(normalized, function (mod) {
      if (mod.Timetable) {
        var lessons = mod.Timetable.map(function (lesson) {
          return {
            group: lesson.ClassNo,
            type: lesson.LessonType,
            week: lesson.WeekText.replace(' ', '&nbsp;'),
            day: lesson.DayText,
            start: lesson.StartTime,
            end: lesson.EndTime,
            room: lesson.Venue
          };
        });
      }
      cors[mod.ModuleCode] = {
        label: mod.ModuleCode,
        department: mod.Department,
        title: mod.ModuleTitle,
        description: mod.ModuleDescription,
        mcs: mod.ModuleCredit,
        prerequisite: mod.Prerequisite,
        preclusion: mod.Preclusion,
        workload: mod.Workload,
        examTime: mod.ExamDate,
        types: mod.Types || ['Not in CORS'],
        lecturers: mod.Lecturers,
        lectures: _.filter(lessons, function (lesson) {
          return lessonTypes[lesson.type] === 'Lecture';
        }),
        tutorials: _.filter(lessons, function (lesson) {
          return lessonTypes[lesson.type] === 'Tutorial';
        })
      };
    });

    grunt.file.write(
      path.join(basePath, options.destFileName),
      JSON.stringify(mod_info, null, options.jsonSpace)
    );
  });
};
