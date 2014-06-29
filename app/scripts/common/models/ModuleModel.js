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

    var prettifyDepartment = function (dept) {
      var words = [];
      _.each(dept.split(' '), function (word) {
        words.push(word.charAt(0) + word.slice(1).toLowerCase());
      })
      return words.join(' ');
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

        var department = this.get('Department');
        if (department) {
          this.set('Department', prettifyDepartment(department));
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
          
          var AVAILABLE_TYPES = ['LECTURE', 'SECTIONAL TEACHING', 'SEMINAR-STYLE MODULE CLASS', 'PACKAGED LECTURE', 'PACKAGED TUTORIAL', 
                                 'TUTORIAL', 'TUTORIAL TYPE 2', 'TUTORIAL TYPE 3', 'DESIGN LECTURE', 'LABORATORY', 'RECITATION'];
          timetableTypes = _.sortBy(timetableTypes, function (type) {
            return AVAILABLE_TYPES.indexOf(type);
          })
          
          var formattedTimetable = [];
          _.each(timetableTypes, function (type) {
            var lessons = _.filter(timetable, function (lesson) {
              return lesson.LessonType == type;
            })
            lessons = _.sortBy(lessons, function (lesson) {
              return parseInt(lesson.ClassNo);
            })
            _.each(lessons, function (lesson) {
              delete lesson.LessonType;
              _.each(lesson, function (value, key) {
                if (key === 'Venue') { return; }
                var words = [];
                _.each(value.split(' '), function (word) {
                  words.push(word.charAt(0) + word.slice(1).toLowerCase());
                })
                lesson[key] = words.join(' ');
              })
            })
            var prettyLessonType = type.charAt(0) + type.slice(1).toLowerCase();
            formattedTimetable.push({
              LessonType: prettyLessonType,
              Lessons: lessons
            });
          })

          this.set('FormattedTimetable', formattedTimetable);
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
