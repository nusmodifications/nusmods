'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'IVLE',
  icon: 'graduation-cap',
  url: '/ivle'
});

var controller = {
  showIvle: function () {
    var IvleView = require('./views/IvleView');
    navigationItem.select();
    App.mainRegion.show(new IvleView());
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'ivle': 'showIvle'
    }
  });
});

