'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'Bare Nusessities',
  icon: 'photo',
  url: '/BareNUS'
});

var controller = {
  showNus: function () {
    var BareNusView = require('./views/BareNusView');
    navigationItem.select();
    App.mainRegion.show(new BareNusView());
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'BareNUS': 'showNus'
    }
  });
});

