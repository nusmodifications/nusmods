'use strict';

var Backbone = require('backbone');
var _ = require('underscore');
var config = require('../../common/config');
var modulify = require('../utils/modulify');
var padTwo = require('../utils/padTwo');

// Convert exam in ISO format to 12-hour date/time format. We slice off the
// SGT time zone and interpret as UTC time, then use the getUTC* methods so
// that they will correspond to Singapore time regardless of the local time
// zone.
var examStr = function (exam) {
  if (exam) {
    var date = new Date(exam.slice(0,16) + 'Z');
    var hours = date.getUTCHours();
    return padTwo(date.getUTCDate()) +
      '-' + padTwo(date.getUTCMonth() + 1) +
      '-' + date.getUTCFullYear() +
      ' ' + (hours % 12 || 12) +
      ':' + padTwo(date.getUTCMinutes()) +
      ' ' + (hours < 12 ? 'AM' : 'PM');
  }
  return null;
};

var DESCRIPTION_LIMIT = 40;

var shortenDescription = function (desc) {
  return desc.split(' ').splice(0, DESCRIPTION_LIMIT).join(' ');
};

var workloadify = function (workload) {
  var workloadArray = workload.split('-');
  var workloadComponents = {
    lectureHours: workloadArray[0],
    tutorialHours: workloadArray[1],
    labHours: workloadArray[2],
    projectHours: workloadArray[3],
    preparationHours: workloadArray[4]
  };
  _.each(workloadComponents, function (value, key) {
    workloadComponents[key] = parseInt(value);
  });
  return workloadComponents;
};

var semesterNames = config.semesterNames;

module.exports = Backbone.Model.extend({
  idAttribute: 'ModuleCode',
  initialize: function() {
    var description = this.get('ModuleDescription');
    if (description && description.split(' ').length > DESCRIPTION_LIMIT + 10) {
      this.set('ShortModuleDescription', shortenDescription(this.get('ModuleDescription')));
    }

    var workload = this.get('Workload');
    if (workload) {
      this.set('WorkloadComponents', workloadify(workload));
    }

    var prerequisite = this.get('Prerequisite');
    if (prerequisite) {
      this.set('linkedPrerequisite', modulify.linkifyModules(prerequisite));
    }

    var corequisite = this.get('Corequisite');
    if (corequisite) {
      this.set('linkedCorequisite', modulify.linkifyModules(corequisite));
    }

    var preclusion = this.get('Preclusion');
    if (preclusion) {
      this.set('linkedPreclusion', modulify.linkifyModules(preclusion));
    }

    _.each(this.get('History'), function (history) {
      history.semesterName = semesterNames[history.Semester - 1];
      history.examStr = examStr(history.ExamDate);
      if (history.examStr) {
        history.examDateStr = history.examStr.slice(0, 10);
        history.examTimeStr = history.examStr.slice(11);
      }

      var timetable = history.Timetable;
      if (timetable) {
        var timetableTypes = [];
        _.each(timetable, function (lesson) {
          if (timetableTypes.indexOf(lesson.LessonType) < 0) {
            timetableTypes.push(lesson.LessonType);
          }
        });

        var AVAILABLE_TYPES = [
          'Lecture',
          'Sectional Teaching',
          'Seminar-Style Module Class',
          'Packaged Lecture',
          'Packaged Tutorial',
          'Tutorial',
          'Tutorial Type 2',
          'Tutorial Type 3',
          'Design Lecture',
          'Laboratory',
          'Recitation'
        ];

        var PLURALIZED_LESSON_TYPES = {
          'Lecture': 'Lectures',
          'Sectional Teaching': 'Sectional Teachings',
          'Seminar-Style Module Class': 'Seminar-Style Module Classes',
          'Packaged Lecture': 'Packaged Lectures',
          'Packaged Tutorial': 'Packaged Tutorials',
          'Tutorial': 'Tutorials',
          'Tutorial Type 2': 'Tutorial Type 2',
          'Tutorial Type 3': 'Tutorial Type 3',
          'Design Lecture': 'Design Lectures',
          'Laboratory': 'Laboratories',
          'Recitation': 'Recitations'
        };

        timetableTypes = _.sortBy(timetableTypes, function (type) {
          return AVAILABLE_TYPES.indexOf(type);
        });

        var formattedTimetable = [];
        _.each(timetableTypes, function (type) {
          var lessons = _.filter(timetable, function (lesson) {
            return lesson.LessonType === type;
          });
          lessons = _.sortBy(lessons, function (lesson) {
            // The default sort is alphabetical, which is not ideal becase
            // classes appear in this order: T1, T10, T2, T3, ...
            // Hence pad with zero then sort alphabetically (assuming < 100 classes)
            var result = lesson.ClassNo.match(/\d/);
            if (!result) {
              return lesson.ClassNo;
            }
            var alpha = lesson.ClassNo.substring(0, result.index);
            var number = parseInt(lesson.ClassNo.slice(result.index));
            if (number < 10) {
              number = '0' + number.toString();
            }
            return alpha + number;
          });
          formattedTimetable.push({
            LessonType: PLURALIZED_LESSON_TYPES[type],
            Lessons: lessons
          });
        });

        history.formattedTimetable = formattedTimetable;
      }
    });

    var corsBiddingStats = this.get('CorsBiddingStats');
    if (corsBiddingStats) {
      var formattedCorsBiddingStats = [];

      var semesters = [];
      _.each(corsBiddingStats, function (stats) {
        var sem = stats.AcadYear + ',' + stats.Semester;
        if (semesters.indexOf(sem) < 0) {
          semesters.push(sem);
        }
      });

      _.each(semesters, function (sem) {
        var parts = sem.split(',');
        var acadYear = parts[0];
        var semester = parts[1];
        var stats = _.filter(corsBiddingStats, function (stat) {
          return stat.AcadYear === acadYear && stat.Semester === semester;
        });

        stats = _.map(stats, function (stat) {
          stat = _.omit(stat, ['AcadYear', 'Semester']);
          return stat;
        });

        formattedCorsBiddingStats.push({
          Semester: 'AY' + acadYear + ' Sem ' + semester,
          BiddingStats: stats
        });
      });
      this.set('FormattedCorsBiddingStats', formattedCorsBiddingStats);
    }

    this.on('change:ExamDate', function () {
      this.set('examStr', examStr(this.get('ExamDate')));
    });

    var types = this.get('Types');
    this.set('inCORS', types && types.indexOf('Not in CORS') === -1);

    this.set('CORSLink', config.corsUrl + this.get('ModuleCode'));
    this.set('IVLELink', config.ivleUrl.replace('<ModuleCode>', this.get('ModuleCode')));

    var modSemesterNames = [];
    this.set('hasExams', false);
    var history = this.get('History');
    if (history) {
      var semestersOffered = [{semester: 1, name: semesterNames[0]}, {semester: 2, name: semesterNames[1]}, {semester: 3, name: semesterNames[2]}, {semester: 4, name: semesterNames[3]}];
      for (var i = 0; i < history.length; i++) {
        if (history[i].ExamDate) {
          this.set('hasExams', true);
        }
        var sem = history[i].Semester;
        modSemesterNames.push(semesterNames[sem - 1]);
        semestersOffered[sem - 1].offered = true;
      }
      this.set('semesterNames', modSemesterNames);
      this.set('semestersOffered', semestersOffered);
    }
  }
});
