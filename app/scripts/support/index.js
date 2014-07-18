'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var controller = {
  showChat: function () {
    var ChatView = require('./views/ChatView');
    App.mainRegion.show(new ChatView());
    App.navigationRegion.currentView.options.collection.deselect();
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'support': 'showChat',
    }
  });
});
