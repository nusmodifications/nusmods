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
    window.setInterval(function() {
      self.updateDayTimeIndicator.call(self);
    }, 60000);

    // initial updating
    this.updateDayTimeIndicator();
  },

  updateDayTimeIndicator: function() {
    var day = moment().format('ddd').toLowerCase();
    var hour = padTwo(moment().hour());
    var minutes = moment().minute();

    // convert the minutes to either 00 or 30
    if (minutes < 30) {
      minutes = '00';
    } else {
      minutes = '30';
    }

    this.$('#timetable .currentDayTime').removeClass('currentDayTime');
    this.$('#' + day + ' .h' + hour + '.m' + minutes).addClass('currentDayTime');
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
