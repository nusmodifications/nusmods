define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var Router = Marionette.AppRouter.extend({
      appRoutes: {
        'timetable-builder': 'showTimetableBuilder'
      }
    });

    var API = {
      showTimetableBuilder: function () {
        require(['./views/TimetableBuilderView'],
          function (TimetableBuilderView) {
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
