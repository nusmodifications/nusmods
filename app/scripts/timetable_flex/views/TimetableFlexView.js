'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var template = require('../templates/timetable_flex.hbs');
var Backbone = require('backbone');
var timify = require('../../common/utils/timify');

module.exports = Marionette.LayoutView.extend({
  template: template,
  initialize: function () {
    console.log(this.model);
    var dayAvailability = this.model.get('dayAvailability');
    _.each(dayAvailability, function (day) {
      var range = _.map(_.range(timify.convertTimeToIndex('0800'), 
                                timify.convertTimeToIndex('2400')), function () {
        return {
          width: 1,
          module: ''
        }
      });

      _.each(day.classes, function (lesson) {
        var eightAmIndex = timify.convertTimeToIndex('0800');
        var startIndex = timify.convertTimeToIndex(lesson.StartTime) - eightAmIndex;
        var endIndex = timify.convertTimeToIndex(lesson.EndTime) - eightAmIndex;
        var width = endIndex - startIndex;
        range[startIndex] = {
          width: width,
          label: lesson.ModuleCode,
          class: 'nm-flex-occupied'
        };
      });

      var finalRange = [];
      var step;
      for (var i = 0; i < range.length; i += step) {
        step = range[i].width;
        finalRange.push(range[i]);
      }
      day.timetable = finalRange;
    });
  }
});
