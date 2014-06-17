define([
  'backbone.marionette',
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

function(Marionette, template, TimetableModuleCollection, SelectedModulesView,
         SelectView, ExportView, ExamCollection, ExamsView, LessonCollection,
         TimetableView, UrlSharingView, localforage) {
  'use strict';

  return Marionette.Layout.extend({
    template: template,

    regions: {
      examsRegion: '#exam-timetable',
      selectedModsRegion: '#selected-mods',
      selectRegion: '#select2'
    },

    onShow: function() {
      var exams = new ExamCollection();
      var timetable = new LessonCollection();
      var selectedModules = new TimetableModuleCollection([], {
        timetable: timetable,
        exams: exams
      });

      var timetableView = new TimetableView({collection: timetable});

      this.examsRegion.show(new ExamsView({collection: exams}));
      this.selectedModsRegion.show(new SelectedModulesView({
        collection: selectedModules
      }));
      this.selectRegion.show(new SelectView({
        collection: selectedModules
      }));
      var exportView = new ExportView({
        collection: selectedModules,
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
    }
  });
});
