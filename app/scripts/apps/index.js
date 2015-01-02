'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'Apps',
  icon: 'cubes',
  url: '/apps'
});

var controller = {
  showApps: function () {
    var AppsView = require('./views/AppsView');
    navigationItem.select();
    App.mainRegion.show(new AppsView());
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'apps': 'showApps'
    }
  });
});

