define(['require', 'app', 'backbone.marionette', 'json!../common/utils/themeOptions.json'],
  function (require, App, Marionette, themeOptions) {
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
            var preferencesModel = new Backbone.Model({themes: themeOptions});
            App.mainRegion.show(new PreferencesView({model: preferencesModel}));
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
