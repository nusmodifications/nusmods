define([
  'underscore',
  'backbone',
  'common/collections/ModuleCollection',
  '../models/LessonModel',
  '../collections/LessonCollection'
],
  function(_, Backbone, ModuleCollection, LessonModel, LessonCollection) {
    'use strict';

    return ModuleCollection.extend({
      initialize: function (models, options) {
        this.colors = [];
        this.exams = options.exams;
        this.timetable = options.timetable;

        this.on('add', this.onAdd, this);
        this.on('remove', this.onRemove, this);
      },

      onAdd: function(module) {
        var code = module.get('id');

        if (!this.colors.length) {
          this.colors = [0, 1, 2, 3, 4, 5, 6, 7];
        }
        var color = this.colors.splice(Math.floor(Math.random() * this.colors.length), 1)[0];
        var title = timetableData.mods[code].title;

        this.exams.add({
          color: color,
          id: code,
          time: module.get('examStr'),
          title: title,
          unixTime: module.get('exam')
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
              var lesson = new LessonModel({
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

      onRemove: function(module) {
        this.timetable.remove(this.timetable.where({code: module.id}));
        this.exams.remove(this.exams.get(module.id));
      }
    });
  });
