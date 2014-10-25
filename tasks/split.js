'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('split', function () {
    var options = this.options();

    var path = require('path');
    var _ = require('lodash');
    var timify = require('./timify');

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

    var moduleInformation = [];

    normalized.forEach(function (mod) {
      grunt.file.write(
        path.join(basePath, options.destSubfolder, mod.ModuleCode + '.json'),
        JSON.stringify(mod, null, options.jsonSpace)
      );

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
        'ExamDate',
        'Types',
        'Lecturers',
        'LecturePeriods',
        'TutorialPeriods'
      ]);
      moduleInformation.push(info);
      grunt.file.write(
        path.join(basePath, options.destSubfolder, mod.ModuleCode, 'index.json'),
        JSON.stringify(info, null, options.jsonSpace)
      );

      grunt.file.write(
        path.join(basePath, options.destSubfolder, mod.ModuleCode, 'corsbiddingstats.json'),
        JSON.stringify(mod.CorsBiddingStats || [], null, options.jsonSpace)
      );
      grunt.file.write(
        path.join(basePath, options.destSubfolder, mod.ModuleCode, 'ivle.json'),
        JSON.stringify(mod.IVLE || [], null, options.jsonSpace)
      );
      grunt.file.write(
        path.join(basePath, options.destSubfolder, mod.ModuleCode, 'timetable.json'),
        JSON.stringify(mod.Timetable || [], null, options.jsonSpace)
      );
    });

    var timetables = normalized.map(function (mod) {
      return _.pick(mod, [
        'ModuleCode',
        'ModuleTitle',
        'Timetable'
      ]);
    });

    // timetable.json
    grunt.file.write(
      path.join(basePath, options.destTimetableInformation), 
      JSON.stringify(timetables, null, options.jsonSpace)
    );

    var venues = {};
    _.each(timetables, function (module) {
      if (module.Timetable) {
        _.each(module.Timetable, function (cls) {
          var cls = _.clone(cls);
          var currentVenue = cls.Venue;
          if (!venues[currentVenue]) {
            venues[currentVenue] = [];
          }
          cls.ModuleCode = module.ModuleCode;
          delete cls.Venue;
          venues[currentVenue].push(cls);
        });
      }
    });

    venues = _.omit(venues, ''); // Delete empty venue string
    var schoolDays = timify.getSchoolDays();

    _.each(_.keys(venues), function (venueName) {
      var venueTimetable = venues[venueName];
      var newVenueTimetable = [];
      
      _.each(schoolDays, function (day) {
        var classes = _.filter(venueTimetable, function (cls) {
          return cls.DayText === day;
        });
        classes = _.sortBy(classes, function (cls) {
          return cls.StartTime + cls.EndTime;
        });

        var timeRange = _.range(timify.convertTimeToIndex('0800'), 
                                timify.convertTimeToIndex('2400'));
        var availability = _.object(_.map(timeRange, function (index) {
          return [timify.convertIndexToTime(index), 'vacant'];
        }));

        _.each(classes, function (cls) {
          var startIndex = timify.convertTimeToIndex(cls.StartTime);
          var endIndex = timify.convertTimeToIndex(cls.EndTime) - 1;
          for (var i = startIndex; i <= endIndex; i++) {
            availability[timify.convertIndexToTime(i)] = 'occupied';
          }
        });

        // availability: {
        //    "0800": "vacant",
        //    "0830": "vacant",
        //    "0900": "occupied",
        //    "0930": "occupied",
        //    ...
        //    "2330": "vacant"
        // }

        newVenueTimetable.push({
          day: day,
          classes: classes,
          availability: availability
        });
      });
      venues[venueName] = newVenueTimetable;
    });

    // venueInformation.json
    grunt.file.write(
      path.join(basePath, options.destVenueInformation), 
      JSON.stringify(venues, null, options.jsonSpace)
    );

    // moduleInformation.json
    grunt.file.write(
      path.join(basePath, options.destModuleInformation),
      JSON.stringify(moduleInformation, null, options.jsonSpace)
    );
  });
};
