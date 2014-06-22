define([
  'underscore',
  'backbone',
  'backbone.marionette',
  'NUSMods',
  'hbs!../templates/timetable_builder',
  '../collections/TimetableModuleCollection',
  './SelectedModulesView',
  './SelectView',
  './ExportView',
  '../collections/ExamCollection',
  './ExamsView',
  '../collections/LessonCollection',
  './TimetableView',
  './UrlSharingView',
  'localforage',
  'bootstrap/button',
  'bootstrap/dropdown'
],

function(_, Backbone, Marionette, NUSMods, template, TimetableModuleCollection,
         SelectedModulesView, SelectView, ExportView, ExamCollection, ExamsView,
         LessonCollection, TimetableView, UrlSharingView, localforage) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template,

    regions: {
      examsRegion: '#exam-timetable',
      selectedModsRegion: '#selected-mods',
      selectRegion: '#select2'
    },

    onShow: function() {
      var exams = new ExamCollection();
      this.timetable = new LessonCollection();
      this.selectedModules = new TimetableModuleCollection([], {
        timetable: this.timetable,
        exams: exams
      });

      this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
      this.listenTo(this.timetable, 'change', this.modulesChanged);

      var timetableView = new TimetableView({collection: this.timetable});

      this.examsRegion.show(new ExamsView({collection: exams}));
      this.selectedModsRegion.show(new SelectedModulesView({
        collection: this.selectedModules
      }));
      this.selectRegion.show(new SelectView({
        collection: this.selectedModules
      }));
      var exportView = new ExportView({
        collection: this.selectedModules,
        exams: exams
      });

      var urlSharingView = new UrlSharingView();

      $('#show-hide button:last-child').qtip({
        content: 'Only shown if Odd / Even / Irregular',
        position: {
          my: 'bottom right'
        }
      });
      $('#show-hide').on('click', '.btn', function() {
        $('#timetable-wrapper').toggleClass('hide-' + $(this).text().toLowerCase());
      });
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
