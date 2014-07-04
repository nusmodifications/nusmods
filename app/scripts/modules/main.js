define(['app', 'backbone.marionette', './controllers/ModulesController'],
  function (App, Marionette, ModulesController) {
    'use strict';

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: new ModulesController(),
        appRoutes: {
          'modules(/:id)(/:section)': 'showModules'
        }
      });
    });
  });
