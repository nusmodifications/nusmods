'use strict';

var $ = require('jquery');
var padTwo = require('../utils/padTwo');
var LessonView = require('./LessonView');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var template = require('../templates/table.hbs');

module.exports = Marionette.CompositeView.extend({
  id: 'timetable',
  tagName: 'table',
  childView: LessonView,
  childViewOptions: function () {
    return {
      parentView: this,
      timetable: this.collection
    };
  },
  template: template,

  events: {
    'mousemove': 'mouseMove',
    'mouseleave': 'mouseLeave'
  },

  ui: {
    colgroups: 'colgroup'
  },

  onRender: function() {
    var self = this;

    // updates every minute thereafter
    window.setTimeout(function() {
      self.updateDayTimeIndicator.call(self);
    }, 60000);

    // initial updating
    this.updateDayTimeIndicator();
  },

  updateDayTimeIndicator: function() {
    var nowDate = new Date();
    var day = nowDate.getDay();
    var hour = padTwo(nowDate.getHours());
    var minutes = nowDate.getMinutes();

    // leading zero check
    if (hour < 10) {
      hour = '0' + hour;
    }

    // convert the minutes to either 00 or 30
    if (minutes < 30) {
      minutes = '00';
    } else {
      minutes = '30';
    }

    var dayMapping = [
      'sun',
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat'
    ];

    $('#timetable td').css('background', 'none');
    $('#' + dayMapping[day] + ' .h' + hour + '.m' + minutes).css('background', 'rgba(255, 140, 20, 0.5)');
  },

  mouseMove: function(evt) {
    if (!this.colX) {
      this.colX = this.$('#times > th + th')
        .map(function() { return $(this).offset().left; })
        .get();
    }

    var currCol = this.ui.colgroups.eq(_.sortedIndex(this.colX, evt.pageX));
    if (!currCol.is(this.prevCol)) {
      if (this.prevCol) {
        this.prevCol.removeAttr('class');
      }
      currCol.addClass('hover');
      this.prevCol = currCol;
    }
  },

  mouseLeave: function() {
    if (this.prevCol) {
      this.prevCol.removeAttr('class');
      this.prevCol = false;
    }
  },

  attachBuffer: function () {
  },

  attachHtml: function () {
  }
});
