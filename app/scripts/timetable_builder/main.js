define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Timetable',
      icon: 'table',
      url: '#timetable-builder'
    });

    var controller = {
      showTimetableBuilder: function () {
        require(['./views/TimetableBuilderView'],
          function (TimetableBuilderView) {
            navigationItem.select();
            App.mainRegion.show(new TimetableBuilderView());
          });
      }
    };

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: controller,
        appRoutes: {
          'timetable-builder': 'showTimetableBuilder'
        }
      });
    });
  });
