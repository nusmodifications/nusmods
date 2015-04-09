'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var team = require('./team.json');

var controller = {
  showAbout: function () {
    var AboutView = require('./views/AboutView');
    App.mainRegion.show(new AboutView());
    App.navigationRegion.currentView.options.collection.deselect();
  },
  showTeam: function () {
    var TeamView = require('./views/TeamView');
    var teamModel = new Backbone.Model({team: team});
    App.mainRegion.show(new TeamView({model: teamModel}));
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
