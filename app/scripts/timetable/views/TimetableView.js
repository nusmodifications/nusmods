'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var ExamsView = require('./ExamsView');
var ExportView = require('./ExportView');
var Marionette = require('backbone.marionette');
var SelectView = require('./SelectView');
var SemesterSelectorView = require('./SemesterSelectorView');
var SharedTimetableControlsView = require('./SharedTimetableControlsView');
var ShowHideView = require('./ShowHideView');
var TimetableView = require('./TableView');
var TipsView = require('./TipsView');
var UrlSharingView = require('./UrlSharingView');
var config = require('../../common/config');
var template = require('../templates/timetable.hbs');
var tips = require('../tips.json');

module.exports = Marionette.LayoutView.extend({
  template: template,

  regions: {
    examsRegion: '#exam-timetable',
    exportRegion: '.export-region',
    selectRegion: '.select-region',
    semesterSelectorRegion: '.semester-selector-region',
    sharedTimetableControlsRegion: '.shared-timetable-controls-region',
    showHideRegion: '.show-hide-region',
    timetableRegion: '#timetable-wrapper',
    tipsRegion: '.tips-region',
    urlSharingRegion: '.url-sharing-region'
  },

  initialize: function (options) {
    this.academicYear = options.academicYear;
    this.semester = options.semester;
  },

  onShow: function() {
    this.selectedModules = App.request('selectedModules', this.semester);
    this.timetable = this.selectedModules.timetable;

    this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
    this.listenTo(this.timetable, 'change', this.modulesChanged);

    this.examsRegion.show(new ExamsView({collection: this.selectedModules.exams}));
    this.exportRegion.show(new ExportView({
      academicYear: this.academicYear,
      collection: this.selectedModules,
      exams: this.selectedModules.exams,
      semester: this.semester
    }));
    this.selectRegion.show(new SelectView({
      semester: this.semester
    }));
    if (this.selectedModules.shared) {
      this.sharedTimetableControlsRegion.show(new SharedTimetableControlsView({
        collection: this.selectedModules
      }));
    }
    this.semesterSelectorRegion.show(new SemesterSelectorView({
      semester: this.semester
    }));
    this.showHideRegion.show(new ShowHideView());
    this.timetableRegion.show(new TimetableView({collection: this.timetable}));

    var tipsModel = new Backbone.Model({tips: tips});
    this.tipsRegion.show(new TipsView({model: tipsModel}));

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
