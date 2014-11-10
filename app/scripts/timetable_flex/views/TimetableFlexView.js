'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var template = require('../templates/timetable_flex.hbs');
var Backbone = require('backbone');
var timify = require('../../common/utils/timify');
var LessonModel = require('../../common/models/LessonModel');

require('bootstrap/tooltip');
require('bootstrap/popover');

module.exports = Marionette.LayoutView.extend({
  template: template,
  initialize: function () {
    var that = this;

    var lessonsList = this.model.get('lessonsList');
    var dayAvailability = this.convertToDayAvailability(lessonsList);

    this.model.set('dayAvailability', dayAvailability);
    _.each(dayAvailability, function (day) {
      var range = _.map(_.range(timify.convertTimeToIndex('0800'), 
                                timify.convertTimeToIndex('2400')), function () {
        return {
          width: 1,
          module: '',
          label: ''
        }
      });

      var eightAmIndex = timify.convertTimeToIndex('0800');

      if (that.model.get('mergeMode')) {
        _.each(day.lessons, function (lesson) {
          var startIndex = timify.convertTimeToIndex(lesson.StartTime) - eightAmIndex;
          var endIndex = timify.convertTimeToIndex(lesson.EndTime) - eightAmIndex;
          var width = endIndex - startIndex;
          for (var i = startIndex; i < endIndex; i++) {
            var overlap = range[i].count;
            if (!overlap) {
              overlap = 1;
              range[i].names = {};
            } else {
              overlap += 1;
            }
            range[i].names[lesson.name] = true;
            range[i].count = overlap;
            range[i].class = 'nm-flex-clash-' + overlap;
          }
        });
      } else {
        _.each(day.lessons, function (lesson) {
          
          var startIndex = timify.convertTimeToIndex(lesson.StartTime) - eightAmIndex;
          var endIndex = timify.convertTimeToIndex(lesson.EndTime) - eightAmIndex;
          var width = endIndex - startIndex;
          range[startIndex] = {
            width: width,
            label: lesson.ModuleCode,
            class: 'nm-flex-occupied',
            type: LessonModel.typeAbbrev[lesson.LessonType],
            classNo: lesson.ClassNo
          };
        });
      }

      var finalRange = [];
      var step;
      for (var i = 0; i < range.length; i += step) {
        step = range[i].width;
        finalRange.push(range[i]);
        if (that.model.get('mergeMode')) {
          range[i].nameList = _.keys(range[i].names).join(', ');
        }
      }
      day.timetable = finalRange;
    });
  },
  onShow: function () {
    $('.js-nm-timetable-overlap-cell').tooltip();
  },
  convertToDayAvailability: function (lessonsList) {
    var days = timify.getSchoolDays();
    var dayAvailability = []
    _.each(days, function (day) {
      var lessons = _.filter(lessonsList, function (lesson) {
        return lesson.DayText === day;
      });
      lessons = _.sortBy(lessons, function (lesson) {
        return lesson.StartTime + lesson.EndTime;
      });

      var timeRange = _.range(timify.convertTimeToIndex('0800'), 
                              timify.convertTimeToIndex('2400'));
      var availability = _.object(_.map(timeRange, function (index) {
        return [timify.convertIndexToTime(index), 'vacant'];
      }));

      _.each(lessons, function (lesson) {
        var startIndex = timify.convertTimeToIndex(lesson.StartTime);
        var endIndex = timify.convertTimeToIndex(lesson.EndTime) - 1;
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

      dayAvailability.push({
        day: day,
        lessons: lessons,
        availability: availability,
        shortDay: day.slice(0, 3)
      });
    });
    return dayAvailability;
  }
});
