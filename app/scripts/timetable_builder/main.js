define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var Router = Marionette.AppRouter.extend({
      appRoutes: {
        'timetable-builder': 'showTimetableBuilder'
      }
    });

    var navigationItem = App.request('addNavigationItem', {
      name: 'Timetable',
      icon: 'table',
      url: '#timetable-builder'
    });

    var API = {
      showTimetableBuilder: function () {
        require(['./views/TimetableBuilderView'],
          function (TimetableBuilderView) {
            navigationItem.select();
            App.mainRegion.show(new TimetableBuilderView());
          });
      }
    };

    App.addInitializer(function () {
      new Router({
        controller: API
      });
    });
  });
