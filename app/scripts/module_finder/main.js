define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var Router = Marionette.AppRouter.extend({
      appRoutes: {
        'module-finder': 'showModuleFinder'
      }
    });

    var API = {
      showModuleFinder: function () {
        require(['./views/ModuleFinderView'],
          function (ModuleFinderView) {
            App.mainRegion.show(new ModuleFinderView());
          });
      }
    };

    App.addInitializer(function () {
      new Router({
        controller: API
      });
    });
  });
