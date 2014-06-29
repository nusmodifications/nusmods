define([
  'underscore',
  'app',
  'backbone',
  'backbone.marionette',
  'NUSMods',
  'hbs!../templates/timetable_builder',
  './ExportView',
  './ExamsView',
  './ShowHideView',
  './TimetableView',
  './UrlSharingView',
  'localforage'
],

function(_, App, Backbone, Marionette, NUSMods, template,
         ExportView, ExamsView, ShowHideView,
         TimetableView, UrlSharingView, localforage) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template,

    regions: {
      examsRegion: '#exam-timetable',
      exportRegion: '.export-region',
      showHideRegion: '.show-hide-region',
      timetableRegion: '#timetable-wrapper',
      urlSharingRegion: '.url-sharing-region'
    },

    onShow: function() {
      this.selectedModules = App.request('selectedModules');
      this.timetable = this.selectedModules.timetable;
      var exams = this.selectedModules.exams;

      this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
      this.listenTo(this.timetable, 'change', this.modulesChanged);

      this.examsRegion.show(new ExamsView({collection: exams}));
      this.exportRegion.show(new ExportView({
        collection: this.selectedModules,
        exams: exams
      }));
      this.showHideRegion.show(new ShowHideView());
      this.timetableRegion.show(new TimetableView({collection: this.timetable}));
      this.urlSharingRegion.show(new UrlSharingView());
    },

    modulesChanged: function (model, collection, options) {
      if (options && options.settingOptions) {
        return;
      }
      var newOptions = {selectedModules: this.selectedModules.toJSON()};
      localforage.setItem('timetableBuilderOptions', newOptions);
      Backbone.history.navigate('timetable-builder/' +
        encodeURIComponent(JSON.stringify(newOptions)));
    },

    setOptions: function (options) {
      if (!options) {
        return;
      }
      _.each(options.selectedModules, function (module) {
        NUSMods.getMod(module.code, _.bind(function (mod) {
          mod.id = module.code;
          this.selectedModules.add(mod, {settingOptions: true});
          _.each(module.lessons, function (lesson) {
            var remove = this.timetable.where({
              code: module.code,
              type: lesson.type
            });
            this.timetable.remove(remove);
            this.timetable.add(remove[0].get('sameType').where({
              group: lesson.group
            }));
          }, this);
        }, this));
      }, this);
    }
  });
});
