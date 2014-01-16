define([
  'underscore',
  'timetabledata',
  'backbone.marionette',
  '../models/LessonModel',
  '../collections/LessonCollection',
  'hbs!../templates/selected_mods',
  'select2'
],
function(_, timetableData, Marionette, Lesson, LessonCollection, template) {
  'use strict';

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

  return Marionette.Layout.extend({
    template: template,

    events: {
      'click #clear-all': function () {
        if (confirm('Are you sure you want to clear all selected modules?')) {
          this.collection.remove(this.collection.models);
        }
        return false;
      }
    },

    initialize: function (options) {
      this.exams = options.exams;
      this.timetable = options.timetable;

      this.listenTo(this.collection, 'add', this.add);
      this.listenTo(this.collection, 'remove', this.remove);
      this.listenTo(this.collection, 'add remove', this.render);
    },

    colors: [],

    add: function(module, collection, options) {
      var code = module.id;

      if (!this.colors.length) {
        this.colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      }
      var color = this.colors.splice(Math.floor(Math.random() * this.colors.length), 1)[0];
      var title = timetableData.mods[code].title;

      this.exams.add({
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
              this.timetable.add(lesson);
            }
          }, this);
          firstGroup = false;
        }, this);
      }, this);
    },

    remove: function(module, collection) {
      this.timetable.remove(this.timetable.where({code: module.id}))
      this.exams.remove(this.exams.get(module.id));
    },

    onRender: function() {
      var length = this.collection.length;
      if (length) {
        this.$('#select2-header').text('Selected ' + length + ' Module' +
            (length === 1 ? '' : 's'));
        this.$('#clear-all').removeClass('hidden');
      } else {
        this.$('#select2-header').text('Select Modules for Timetable ');
        this.$('#clear-all').addClass('hidden');
      }
      this.$('#short-url').val('').blur();
    }
  });
});
