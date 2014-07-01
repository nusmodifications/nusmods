define(['backbone', 'underscore', 'common/utils/padTwo', 'common/utils/modulify'],
  function(Backbone, _, padTwo, modulify) {
    'use strict';

    // Convert exam in Unix time to 12-hour date/time format. We add 8 hours to
    // the UTC time, then use the getUTC* methods so that they will correspond to
    // Singapore time regardless of the local time zone.
    var examStr = function (exam) {
      if (exam) {
        var date = new Date(exam + 288e5);
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
    }

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
    }

    return Backbone.Model.extend({
      idAttribute: 'code',
      initialize: function() {
        // TODO: Display exam date when 2014-2015/1 exam timetable released.
        
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
          this.set('ParsedPrerequisite', modulify.linkifyModules(prerequisite));
        }

        var preclusion = this.get('Preclusion');
        if (preclusion) {
          this.set('ParsedPreclusion', modulify.linkifyModules(preclusion));
        }

        var timetable = this.get('Timetable');
        if (timetable) {
          var timetableTypes = [];
          _.each(timetable, function (lesson) {
            if (timetableTypes.indexOf(lesson.LessonType) < 0) {
              timetableTypes.push(lesson.LessonType);
            }
          });
          
          var AVAILABLE_TYPES = ['Lecture', 'Sectional Teaching', 'Seminar-Style Module Class', 'Packaged Lecture', 'Packaged Tutorial',
                                 'Tutorial', 'Tutorial Type 2', 'Tutorial Type 3', 'Design Lecture', 'Laboratory', 'Recitation'];
          timetableTypes = _.sortBy(timetableTypes, function (type) {
            return AVAILABLE_TYPES.indexOf(type);
          })
          
          var formattedTimetable = [];
          _.each(timetableTypes, function (type) {
            var lessons = _.filter(timetable, function (lesson) {
              return lesson.LessonType == type;
            });
            lessons = _.sortBy(lessons, function (lesson) {
              return parseInt(lesson.ClassNo);
            });
            _.each(lessons, function (lesson) {
              delete lesson.LessonType;
            });
            formattedTimetable.push({
              LessonType: type,
              Lessons: lessons
            });
          })

          this.set('FormattedTimetable', formattedTimetable);
        }

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

            _.each(stats, function (stat) {
              delete stat.AcadYear;
              delete stat.Semester;
            });

            formattedCorsBiddingStats.push({
              Semester: 'AY' + acadYear + ' Sem ' + semester,
              BiddingStats: stats
            });
          });
          this.set('FormattedCorsBiddingStats', formattedCorsBiddingStats);
        }

        // TODO: These attributes are being used by module_item.hbs as model is being loaded from
        //       nus_timetable_data.js and are kept here for backward compatibility.
        this.set('examStr', examStr(this.get('exam')));

        var prereq = this.get('prerequisite');
        if (prereq) {
          this.set('parsedPrerequisite', modulify.linkifyModules(prereq));
        }

        var preclu = this.get('preclusion');
        if (preclu) {
          this.set('parsedPreclusion', modulify.linkifyModules(preclu));
        }
      }
    });
  });
