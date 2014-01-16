define([
  'backbone.marionette',
  'hbs!../templates/timetable_builder',
  'common/collections/ModuleCollection',
  './SelectedModulesView',
  './SelectView',
  './ExportView',
  '../collections/ExamCollection',
  './ExamsView',
  '../collections/LessonCollection',
  './TimetableView',
  './UrlSharingView'
],

function(Marionette, template, ModuleCollection, SelectedModulesView,
         SelectView, ExportView, ExamCollection, ExamsView, LessonCollection,
         TimetableView, UrlSharingView) {
  'use strict';

  var TimetableBuilderView = Marionette.Layout.extend({
    template: template,

    regions: {
      selectedModsRegion: '#selected-mods',
      selectRegion: '#select2'
    },

    onShow: function() {
      var exams = new ExamCollection();
      var examsView = new ExamsView({collection: exams});

      var timetable = new LessonCollection();
      var timetableView = new TimetableView({collection: timetable});

      var selectedModules = new ModuleCollection();
      var selectedModulesView = this.selectedModsRegion.show(new SelectedModulesView({
        collection: selectedModules,
        timetable: timetable,
        exams: exams
      }));
      var selectView = this.selectRegion.show(new SelectView({
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

  return TimetableBuilderView;
});
