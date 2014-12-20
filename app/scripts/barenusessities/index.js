'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'Bare Nusessities',
  icon: 'photo',
  url: '/barenusessities'
});

var controller = {
  showNusessities: function () {
    var NusessitiesView = require('./views/NusessitiesView');
    navigationItem.select();
    App.mainRegion.show(new NusessitiesView());
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'barenusessities': 'showNusessities'
    }
  });
});

