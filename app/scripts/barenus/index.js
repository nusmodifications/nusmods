'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'Bare Nusessities',
  icon: 'newspaper-o',
  url: '/news/bareNUS'
});

var controller = {
  showBareNus: function (fbPageId) {
    var BareNusView = require('./views/BareNusView');
    navigationItem.select();
    App.mainRegion.show(new BareNusView({ fbPageId: fbPageId }));
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'news(/:fbPageId)': 'showBareNus'
    }
  });
});

