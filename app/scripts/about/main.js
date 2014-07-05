define(['require', 'app', 'backbone.marionette', 'backbone'],
  function (require, App, Marionette, Backbone) {
    'use strict';

    var controller = {
      showAbout: function () {
        require(['./views/AboutView'], function (AboutView) {
          App.mainRegion.show(new AboutView());
        });
      },
      showTeam: function () {
        require(['./views/TeamView'], function (TeamView) {
          App.mainRegion.show(new TeamView());
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
