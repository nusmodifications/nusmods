'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');
var ModulesController = require('./controllers/ModulesController');

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: new ModulesController(),
    appRoutes: {
      'modules(/:id)(/:section)': 'showModules'
    }
  });
});
