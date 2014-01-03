define([
  'underscore',
  'timetableData',
  'backbone',
  'models/LessonModel',
  'collections/LessonCollection',
  'select2'
],
function(_, timetableData, Backbone, Lesson, LessonCollection) {
  'use strict';

  var codes = _.keys(timetableData.mods);
  var titles = _.pluck(_.values(timetableData.mods), 'title');
  var modsLength = codes.length;

  var padTwo = function(number) {
    return (number < 10 ? '0' : '') + number;
  };

  // Convert exam in Unix time to 12-hour date/time format. We add 8 hours to
  // the UTC time, then use the getUTC* methods so that they will correspond to
  // Singapore time regardless of the local time zone.
  var examStr = function(exam) {
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

  var SelectedModulesView = Backbone.View.extend({
    el: $('#selected-mods'),

    events: {
      'change': 'change',
      'click #clear-all': function () {
        if (confirm('Are you sure you want to clear all selected modules?')) {
          this.collection.remove(this.collection.models);
        }
        return false;
      }
    },

    change: function(evt) {
      if (evt.added) {
        this.collection.add({
          id: evt.added.id
        });
      } else if (evt.removed) {
        this.collection.remove(this.collection.get(evt.removed.id));
      }
    },

    initialize: function (options) {
      this.options = options;

      this.collection.on('add', this.add, this);
      this.collection.on('remove', this.remove, this);
      this.collection.on('add remove', this.render, this);

      var PAGE_SIZE = 50;
      this.$('#select2').select2({
        width: '100%',
        placeholder: 'Type code/title to add mods',
        multiple: true,
        initSelection: function (el, callback) {
          callback(_.map(el.val().split(','), function (code) {
            return {
              id: code,
              text: code + ' ' + timetableData.mods[code].title
            };
          }));
        },
        query: function (options) {
          var results = [],
              pushResult = function (i) {
                return results.push({
                  id: codes[i],
                  text: codes[i] + ' ' + titles[i]
                });
              };
          if (options.term) {
            var re = new RegExp(options.term, 'i');
            for (var i = options.context | 0; i < modsLength; i++) {
              if (codes[i].search(re) !== -1 || titles[i].search(re) !== -1) {
                if (pushResult(i) === PAGE_SIZE) {
                  i++;
                  break;
                }
              }
            }
          } else {
            for (i = (options.page - 1) * PAGE_SIZE; i < options.page * PAGE_SIZE; i++) {
              pushResult(i);
            }
          }
          options.callback({
            context: i,
            more: i < modsLength,
            results: results
          });
        }
      });
    },

    colors: [],

    add: function(module, collection, options) {
      var code = module.id;

      if (!this.colors.length) {
        this.colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      }
      var color = this.colors.splice(Math.floor(Math.random() * this.colors.length), 1)[0];
      var title = timetableData.mods[code].title;

      this.options.exams.add({
        color: color,
        id: code,
        time: examStr(timetableData.mods[code].exam),
        title: title,
        unixTime: timetableData.mods[code].exam
      });

      var lessonKeys = ['type', 'group', 'week', 'day', 'start', 'end', 'room'];
      var lessons = _.map(timetableData.mods[code].lessons, function(lesson) {
        return _.object(lessonKeys, lesson);
      });

      _.each(_.groupBy(lessons, 'type'), function(groups, type) {
        var firstGroup = true;
        var isDraggable = _.size(groups) > 1;
        var sameType = new LessonCollection();
        _.each(_.groupBy(groups, 'group'), function(lessonsData, group) {
          var sameGroup = new LessonCollection();
          _.each(lessonsData, function(lessonData) {
            var lesson = new Lesson({
              week: lessonData.week,
              day: lessonData.day,
              start: lessonData.start,
              end: lessonData.end,
              room: lessonData.room,
              code: code,
              color: color,
              group: group,
              isDraggable: isDraggable,
              sameGroup: sameGroup,
              sameType: sameType,
              title: title,
              type: type
            });
            sameGroup.add(lesson);
            sameType.add(lesson);
            if (firstGroup) {
              this.options.timetable.add(lesson);
            }
          }, this);
          firstGroup = false;
        }, this);
      }, this);
    },

    remove: function(module, collection) {
      _.each(this.options.timetable.where({code: module.id}), function(lesson) {
        lesson.destroy();
      });
      this.options.exams.get(module.id).destroy();
    },

    render: function() {
      var length = this.collection.length;
      if (length) {
        this.$('#select2-header').text('Selected ' + length + ' Module' +
            (length == 1 ? '' : 's'));
        this.$('#clear-all').show();
      } else {
        this.$('#select2-header').text('Select Modules for Timetable ');
        this.$('#clear-all').hide();
      }
      this.$('#select2').val(this.collection.pluck('id')).trigger('change');
      this.$('#short-url').val('').blur();
    }
  });

  return SelectedModulesView;
});
