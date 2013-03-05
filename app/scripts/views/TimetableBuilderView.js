define([
  'backbone',
  'collections/ModuleCollection',
  'views/SelectedModulesView',
  'views/ExportView',
  'collections/ExamCollection',
  'views/ExamsView',
  'collections/LessonCollection',
  'views/TimetableView',
  'views/UrlSharingView',
  'views/ModuleFinderView'
],

function(Backbone, ModuleCollection, SelectedModulesView, ExportView,
    ExamCollection, ExamsView, LessonCollection, TimetableView, UrlSharingView,
    ModuleFinderView) {
  'use strict';

  var TimetableBuilderView = Backbone.View.extend({
    el: $('#timetable-builder'),

    initialize: function() {
      var exams = new ExamCollection();
      var examsView = new ExamsView({collection: exams});

      var timetable = new LessonCollection();
      var timetableView = new TimetableView({collection: timetable});

      var selectedModules = new ModuleCollection();
      var selectedModulesView = new SelectedModulesView({
        collection: selectedModules,
        timetable: timetable,
        exams: exams
      });
      var exportView = new ExportView({
        collection: selectedModules,
        exams: exams
      });

      var urlSharingView = new UrlSharingView();

      var moduleFinderView = new ModuleFinderView({collection: selectedModules});

      $('#overlay').fadeOut();
      $('#loading').fadeOut();

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