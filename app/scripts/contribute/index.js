'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var controller = {
  showContribute: function () {
    var ContributeView = require('./views/ContributeView');
    App.mainRegion.show(new ContributeView());
    App.navigationRegion.currentView.options.collection.deselect();
  },
  showDevelopers: function () {
    var DevelopersView = require('./views/DevelopersView');
    App.mainRegion.show(new DevelopersView());
    App.navigationRegion.currentView.options.collection.deselect();
  },
  showReviewers: function () {
    var ReviewersView = require('./views/ReviewersView');
    App.mainRegion.show(new ReviewersView());
    App.navigationRegion.currentView.options.collection.deselect();
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'contribute': 'showContribute',
      'contribute/developers': 'showDevelopers',
      'contribute/reviewers': 'showReviewers'
    }
  });
});
