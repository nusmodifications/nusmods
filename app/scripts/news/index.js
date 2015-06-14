'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var newsPagesList = require('./newsPagesList.json');

var navigationItem = App.request('addNavigationItem', {
  name: 'News',
  icon: 'newspaper-o',
  url: '/news/' + newsPagesList[0].id // Display first page
});

var controller = {
  showNews: function (fbPageId) {
    var NewsView = require('./views/NewsView');
    navigationItem.select();
    if (!fbPageId) {
      fbPageId = newsPagesList[0].id;
    }
    App.mainRegion.show(new NewsView({ fbPageId: fbPageId }));
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'news(/:fbPageId)': 'showNews'
    }
  });
});

