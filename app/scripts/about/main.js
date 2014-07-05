define(['require', 'app', 'backbone.marionette', 'backbone'],
  function (require, App, Marionette, Backbone) {
    'use strict';

    var controller = {
      showAbout: function () {
        require(['./views/AboutView'], function (AboutView) {
          App.mainRegion.show(new AboutView());
          App.navigationRegion.currentView.options.collection.deselect();
        });
      },
      showTeam: function () {
        require(['./views/TeamView'], function (TeamView) {
          App.mainRegion.show(new TeamView());
          App.navigationRegion.currentView.options.collection.deselect();
        });
      }
    };

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: controller,
        appRoutes: {
          'about': 'showAbout',
          'team': 'showTeam'
        }
      });
    });
  });
