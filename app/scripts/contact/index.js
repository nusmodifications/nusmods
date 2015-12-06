'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var controller = {
  showContact: function () {
    var ContactView = require('./views/ContactView');
    App.mainRegion.show(new ContactView());
    App.navigationRegion.currentView.options.collection.deselect();
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'contact': 'showContact',
    }
  });
});
