define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Preferences',
      icon: 'gear',
      url: '/preferences'
    });

    var controller = {
      showPreferences: function () {
        require(['./views/PreferencesView'],
          function (PreferencesView) {
            navigationItem.select();
            App.mainRegion.show(new PreferencesView());
          });
      }
    };

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: controller,
        appRoutes: {
          'preferences': 'showPreferences'
        }
      });
    });
  });
