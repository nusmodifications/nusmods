'use strict';

var App = require('../app');
var Backbone = require('Backbone');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'Friends',
  icon: 'user',
  url: '/friends'
});

var controller = {
  showFriends: function () {
    var FriendsView = require('./views/FriendsView');
    navigationItem.select();
    var model = new Backbone.Model();
    App.mainRegion.show(new FriendsView({
      model: model
    }));
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'friends': 'showFriends'
    }
  });
});
