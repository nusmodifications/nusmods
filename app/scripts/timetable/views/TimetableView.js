define([
  'underscore',
  'app',
  'backbone',
  'backbone.marionette',
  'common/config',
  'nusmods',
  'hbs!../templates/timetable',
  '../collections/ExamCollection',
  './ExportView',
  './ExamsView',
  './SelectView',
  './ShowHideView',
  './TableView',
  './UrlSharingView'
],

function(_, App, Backbone, Marionette, config, NUSMods, template, ExamCollection,
         ExportView, ExamsView, SelectView, ShowHideView,
         TimetableView, UrlSharingView) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template,

    regions: {
      examsRegion: '#exam-timetable',
      exportRegion: '.export-region',
      selectRegion: '.select-region',
      showHideRegion: '.show-hide-region',
      timetableRegion: '#timetable-wrapper',
      urlSharingRegion: '.url-sharing-region'
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
      this.showHideRegion.show(new ShowHideView());
      this.timetableRegion.show(new TimetableView({collection: this.timetable}));
      this.urlSharingRegion.show(new UrlSharingView());
      this.modulesChanged(null, null, {replace: true});
    },

    modulesChanged: function (model, collection, options) {
      if (this.selectedModules.length) {
        Backbone.history.navigate(config.semTimetableFragment + '?' +
          this.selectedModules.toQueryString(), options);
      } else {
        Backbone.history.navigate(config.semTimetableFragment, options);
      }
    }
  });
});
