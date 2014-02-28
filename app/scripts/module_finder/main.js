define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var Router = Marionette.AppRouter.extend({
      appRoutes: {
        'module-finder': 'showModuleFinder'
      }
    });

    var navigationItem = App.addNavigationItem({
      name: 'Module Finder',
      icon: 'search',
      url: '#module-finder'
    });

    var API = {
      showModuleFinder: function () {
        require(['./views/ModuleFinderView'],
          function (ModuleFinderView) {
            navigationItem.select();
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
