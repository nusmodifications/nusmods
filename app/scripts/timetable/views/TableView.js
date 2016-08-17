'use strict';

var $ = require('jquery');
var padTwo = require('../../common/utils/padTwo');
var moment = require('moment');
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
  timerUpdateDayTime: null,

  events: {
    'mousemove': 'mouseMove',
    'mouseleave': 'mouseLeave'
  },

  ui: {
    colgroups: 'colgroup'
  },

  onRender: function() {
    var self = this;

    var updateDayTimeIndicatorWrapper = function() {
      self.updateDayTimeIndicator();
    };

    // updates every 5 minutes thereafter
    this.timerUpdateDayTime = window.setInterval(updateDayTimeIndicatorWrapper, 300000); // 5 min * 60 s * 1000 ms

    // initial updating
    window.setTimeout(function() {
      self.updateDayTimeIndicator();
      // whenever window comes into focus, check for latest time.
      // like for switching of tabs
      $(window).on('focus', updateDayTimeIndicatorWrapper);
    }, 0);
  },

  onBeforeDestroy: function() {
    this.timerUpdateDayTime = window.clearInterval(this.timerUpdateDayTime);
  },

  updateDayTimeIndicator: function() {
    var day = moment().format('ddd').toLowerCase();
    var hour = padTwo(moment().hour());

    $('#timetable .current-day-time').removeClass('current-day-time');
    $('#' + day + ' .h' + hour).addClass('current-day-time');
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
