'use strict';

var LessonCollection = require('../collections/LessonCollection');
var LessonModel = require('../models/LessonModel');
var ModuleCollection = require('./ModuleCollection');
var _ = require('underscore');
var qs = require('qs');

module.exports = ModuleCollection.extend({
  initialize: function (models, options) {
    this.colors = [];
    this.timetable = options.timetable;

    this.on('add', this.onAdd, this);
    this.on('remove', this.onRemove, this);
  },

  onAdd: function (module, collection, options) {
    if (!this.colors.length) {
      this.colors = [0, 1, 2, 3, 4, 5, 6, 7];
    }
    var color = this.colors.splice(Math.floor(Math.random() * this.colors.length), 1)[0];
    module.set('color', color);

    var selectedLessonsByType = _.groupBy(options.selectedLessons, 'LessonType');
    var lessons = new LessonCollection();
    module.set('lessons', lessons);
    _.each(_.groupBy(module.get('Timetable'), 'LessonType'), function (groups) {
      var uniqueClassNos = _.uniq(_.pluck(groups, 'ClassNo'));
      var randomClassNo = _.sample(uniqueClassNos);
      var isDraggable = _.size(uniqueClassNos) > 1;
      var sameType = new LessonCollection();
      _.each(_.groupBy(groups, 'ClassNo'), function (lessonsData) {
        var sameGroup = new LessonCollection();
        _.each(lessonsData, function (lessonData) {
          var lesson = new LessonModel(_.extend({
            color: color,
            display: true,
            isDraggable: isDraggable,
            ModuleCode: module.id,
            ModuleTitle: module.get('ModuleTitle'),
            sameGroup: sameGroup,
            sameType: sameType
          }, lessonData));
          lessons.add(lesson);
          sameGroup.add(lesson);
          sameType.add(lesson);
          if (!selectedLessonsByType[lessonData.LessonType] && lessonData.ClassNo === randomClassNo) {
            this.timetable.add(lesson);
          }
        }, this);
      }, this);
    }, this);
    _.each(options.selectedLessons, function (lesson) {
      this.timetable.add(lessons.where(lesson));
    }, this);
    this.timetable.trigger('change');
  },

  onRemove: function (module) {
    this.timetable.remove(this.timetable.where({ModuleCode: module.id}));

    // Return removed color back to color array to prevent
    // uneven distribution when new modules are added.
    this.colors.push(module.get('color'));
  },

  toJSON: function () {
    return this.map(function (module) {
      return {
        ModuleCode: module.id,
        selectedLessons: _.chain(this.timetable.where({ModuleCode: module.id}))
          .map(function (lesson) {
            return lesson.pick('ClassNo', 'LessonType');
          })
          .uniq('LessonType')
          .value()
      };
    }, this);
  },

  toQueryString: function () {
    var qsObject = {};
    this.each(function (module) {
      var qsModule = qsObject[module.id] = {};
      var moduleLessons = this.timetable.where({ModuleCode: module.id});
      if (moduleLessons.length) {
        _.each(moduleLessons, function (lesson) {
          qsModule[lesson.get('typeAbbrev')] = lesson.get('ClassNo');
        });
      } else {
        qsObject[module.id] = '';
      }
    }, this);
    return qs.stringify(qsObject);
  }
}, {
  fromQueryStringToJSON: function (queryString) {
    return _.map(qs.parse(queryString), function (lessons, ModuleCode) {
      return {
        ModuleCode: ModuleCode,
        selectedLessons: _.map(lessons, function (ClassNo, LessonType) {
          return {
            ClassNo: ClassNo,
            LessonType: LessonModel.typeAbbrevInverse[LessonType]
          };
        })
      };
    });
  }
});
