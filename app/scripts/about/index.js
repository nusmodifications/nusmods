'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var controller = {
  showAbout: function () {
    var AboutView = require('./views/AboutView');
    App.mainRegion.show(new AboutView());
    App.navigationRegion.currentView.options.collection.deselect();
  },
  showTeam: function () {
    var TeamView = require('./views/TeamView');
    App.mainRegion.show(new TeamView());
    App.navigationRegion.currentView.options.collection.deselect();
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
