'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var ExamCollection = require('../collections/ExamCollection');
var ExamsView = require('./ExamsView');
var ExportView = require('./ExportView');
var Marionette = require('backbone.marionette');
var SelectView = require('./SelectView');
var SharedTimetableControlsView = require('./SharedTimetableControlsView');
var ShowHideView = require('./ShowHideView');
var TimetableView = require('./TableView');
var UrlSharingView = require('./UrlSharingView');
var config = require('../../common/config');
var template = require('../templates/timetable.hbs');

module.exports = Marionette.LayoutView.extend({
  template: template,

  regions: {
    examsRegion: '#exam-timetable',
    exportRegion: '.export-region',
    selectRegion: '.select-region',
    sharedTimetableControlsRegion: '.shared-timetable-controls-region',
    showHideRegion: '.show-hide-region',
    timetableRegion: '#timetable-wrapper',
    urlSharingRegion: '.url-sharing-region'
  },

  initialize: function (options) {
    this.semester = options.semester;
  },

  onShow: function() {
    this.selectedModules = App.request('selectedModules');
    this.timetable = this.selectedModules.timetable;
    var exams = new ExamCollection(null, {modules: this.selectedModules});

    this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
    this.listenTo(this.timetable, 'change', this.modulesChanged);

    this.examsRegion.show(new ExamsView({collection: exams}));
    this.exportRegion.show(new ExportView({
      collection: this.selectedModules,
      exams: exams
    }));
    this.selectRegion.show(new SelectView());
    if (this.selectedModules.shared) {
      this.sharedTimetableControlsRegion.show(new SharedTimetableControlsView({
        collection: this.selectedModules
      }));
    }
    this.showHideRegion.show(new ShowHideView());
    this.timetableRegion.show(new TimetableView({collection: this.timetable}));
    this.urlSharingRegion.show(new UrlSharingView({
      collection: this.selectedModules
    }));
    this.modulesChanged(null, null, {replace: true});
  },

  modulesChanged: function (model, collection, options) {
    if (this.selectedModules.length) {
      Backbone.history.navigate(config.semTimetableFragment(this.semester) +
        '?' + this.selectedModules.toQueryString(), options);
    } else {
      Backbone.history.navigate(config.semTimetableFragment(this.semester), options);
    }
  }
});
