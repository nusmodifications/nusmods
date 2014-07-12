define(['require', 'app', 'backbone.marionette', 
    'json!../common/themes/themeOptions.json', 'json!../common/faculty/facultyList.json'],
  function (require, App, Marionette, themeOptions, facultyList) {
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
            var preferencesModel = new Backbone.Model({
              faculties: facultyList,
              themes: themeOptions
            });
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
