module.exports = function(grunt) {
  'use strict';

  grunt.registerTask('jsifyNUS', 'Generate NUS module information JS files.', function() {
    var _ = grunt.utils._;
    
    var options = _.defaults(grunt.config(this.name), {
      destModuleFinder: 'app/scripts/nus_module_data.js',
      destTimetable: 'app/scripts/nus_timetable_data.js',
      src: 'app/json/nus_module_info.json'
    });

    var module_info = grunt.file.readJSON(options.src);

    var titleize = function(str) {
      return _.titleize(str.toLowerCase()).replace("'S", "'s");
    };

    var facultyDepartments = {};
    Object.keys(module_info.facultyDepartments).forEach(function (faculty) {
      facultyDepartments[titleize(faculty)] =
          module_info.facultyDepartments[faculty].map(titleize);
    });

    var dayMap = {
      MONDAY: 0,
      TUESDAY: 1,
      WEDNESDAY: 2,
      THURSDAY: 3,
      FRIDAY: 4,
      SATURDAY: 5
    };

    var typeMap = {
      'DESIGN LECTURE': 0,
      'LABORATORY': 1,
      'LECTURE': 2,
      'PACKAGED LECTURE': 3,
      'PACKAGED TUTORIAL': 4,
      'RECITATION': 5,
      'SECTIONAL TEACHING': 6,
      'SEMINAR-STYLE MODULE CLASS': 7,
      'TUTORIAL': 8,
      'TUTORIAL TYPE 2': 9,
      'TUTORIAL TYPE 3': 10
    };

    var weekMap = {
      'EVERY&nbsp;WEEK': 0,
      'ODD&nbsp;WEEK': 1,
      'EVEN&nbsp;WEEK': 2
    };

    var processedMods = {};

    _.each(module_info.moduleInformation, function (mod, code) {
      var processedMod = _.pick(mod, 'description', 'prerequisite',
          'preclusion', 'title', 'workload');

      processedMod.department = titleize(mod.department);
      processedMod.mc = +mod.modularCredits;

      if (module_info.examTimetable[code]) {
        processedMod.exam = Date.parse(module_info.examTimetable[code]);
      } else if (mod.examDate) {
        grunt.log.error(code + ' exam on ' + mod.examDate +
            ' is in CORS but not in exam timetable yet.');
      }

      var lessons = _.map(mod.lessons, function(lesson) {
        var week = weekMap[lesson.week];
        if (week === undefined) {
          var weekNos = lesson.week.split(',');
          week = weekNos[0];
          for (var i = 1; i < weekNos.length; i++) {
            week += (+weekNos[i - 1] === +weekNos[i] - 1 ? '-' : ',') +
                weekNos[i];
          }
          week = week.replace(/-[^,]+-/g, '-');
        }

        return [
          typeMap[lesson.type],
          lesson.group,
          week,
          dayMap[lesson.day],
          lesson.start,
          lesson.end,
          lesson.room
        ];
      });
      if (lessons.length) {
        processedMod.lessons = lessons;
      }

      processedMods[code] = processedMod;
    });

    var mapType = function(type) {
      var mappedType = typeMap[type];
      if (mappedType === undefined) {
        grunt.warn('Unrecognized lesson type ' + type + '.');
      }
      return mappedType;
    };

    grunt.file.write(options.destTimetable, 'define(' + JSON.stringify({
      correctAsAt: module_info.correctAsAt,
      lectureTypes: module_info.lectureTypes.map(mapType),
      tutorialTypes: module_info.tutorialTypes.map(mapType),
      mods: processedMods
    }, null, '\t') + ');');
    grunt.log.writeln("File " + options.destTimetable + " created.");

    grunt.file.write(options.destModuleFinder, 'define(' + JSON.stringify({
      facultyDepartments: facultyDepartments
    }, null, '\t') + ');');
    grunt.log.writeln("File " + options.destModuleFinder + " created.");
  });
};