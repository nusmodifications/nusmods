'use strict';

var $ = require('jquery');
var ExamView = require('./ExamView');
var Marionette = require('backbone.marionette');
var template = require('../templates/exams.hbs');
var _ = require('underscore');

var EmptyView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template('<td colspan="5" class="empty-timetable">No modules added.</td>')
});

module.exports = Marionette.CompositeView.extend({
  tagName: 'table',
  className: 'table table-bordered table-condensed',
  childView: ExamView,
  childViewContainer: 'tbody',
  emptyView: EmptyView,
  template: template, 
  collectionEvents: {
    'add remove': function () {
      $('#clash').toggleClass('hidden', !this.collection.clashCount);
      this.updateTotalSemesterModuleCredits(); 
    }
  },
  onShow: function () {
    this.updateTotalSemesterModuleCredits();
    this.$('.nm-help').qtip({
      position: {
        my: 'left bottom',
        at: 'right center'
      }
    });
  },
  updateTotalSemesterModuleCredits: function () {
    $('#js-nm-total-mc').text(this.collection.getTotalSemesterModuleCredits());
  },
});
