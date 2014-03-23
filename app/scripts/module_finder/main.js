define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Module Finder',
      icon: 'search',
      url: '#module-finder'
    });

    var controller = {
      showModuleFinder: function () {
        require(['./views/ModuleFinderView'],
          function (ModuleFinderView) {
            navigationItem.select();
            App.mainRegion.show(new ModuleFinderView());
          });
      }
    };

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: controller,
        appRoutes: {
          'module-finder': 'showModuleFinder'
        }
      });
    });
  });
