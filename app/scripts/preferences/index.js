'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var facultyList = require('../common/faculty/facultyList.json');
var themeOptions = require('../common/themes/themeOptions.json');

var navigationItem = App.request('addNavigationItem', {
  name: 'Preferences',
  icon: 'gear',
  url: '/preferences'
});

var controller = {
  showPreferences: function () {
    var PreferencesView = require('./views/PreferencesView');
    navigationItem.select();
    var preferencesModel = new Backbone.Model({
      faculties: facultyList,
      themes: themeOptions
    });
    App.mainRegion.show(new PreferencesView({model: preferencesModel}));
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'preferences': 'showPreferences'
    }
  });
});
