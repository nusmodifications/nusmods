'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var keyboardShortcuts = require('./keyboardShortcuts.json');
var marked = require('marked');

var controller = {
  showHelp: function () {
    var HelpView = require('./views/HelpView');
    _.each(keyboardShortcuts, function (category) {
      _.each(category.shortcuts, function (shortcut) {
        shortcut.description = marked(shortcut.description);
      });
    });

    var helpModel = new Backbone.Model({keyboardShortcuts: keyboardShortcuts});
    App.mainRegion.show(new HelpView({model: helpModel}));
    App.navigationRegion.currentView.options.collection.deselect();
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'help': 'showHelp'
    }
  });
});
