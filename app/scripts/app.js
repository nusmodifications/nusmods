'use strict';

var Backbone = require('backbone');
Backbone.$ = require('jquery');
var Marionette = require('backbone.marionette');
var NUSMods = require('./nusmods');
var NavigationCollection = require('./common/collections/NavigationCollection');
var NavigationView = require('./common/views/NavigationView');
var SelectedModulesController = require('./common/controllers/SelectedModulesController');
var _ = require('underscore');
var config = require('./common/config');
var localforage = require('localforage');
require('backbone.analytics');
require('qTip2');

// Set Backbone.History.initialRoute to allow route handlers to find out if they
// were called from the initial route.
var loadUrl = Backbone.History.prototype.loadUrl;
Backbone.History.prototype.loadUrl = function() {
  if (!Backbone.History.initialRoute) {
    Backbone.History.initialRoute = true;
  } else {
    Backbone.History.initialRoute = false;
    // No longer initial route, restore original loadUrl.
    Backbone.History.prototype.loadUrl = loadUrl;
  }
  return loadUrl.apply(this, arguments);
};

var App = new Marionette.Application();

App.addRegions({
  mainRegion: '.content',
  navigationRegion: 'nav',
  selectRegion: '.navbar-form',
  bookmarksRegion: '.nm-bookmarks'
});

var navigationCollection = new NavigationCollection();
var navigationView = new NavigationView({collection: navigationCollection});
App.navigationRegion.show(navigationView);

App.reqres.setHandler('addNavigationItem', function (navigationItem) {
  return navigationCollection.add(navigationItem);
});

NUSMods.setConfig(config);
NUSMods.generateModuleCodes();

var selectedModulesControllers = [];

for (var i = 0; i < 5; i++) {
  selectedModulesControllers[i] = new SelectedModulesController({
    semester: i + 1
  });
}

App.reqres.setHandler('selectedModules', function (sem) {
  return selectedModulesControllers[sem - 1].selectedModules;
});
App.reqres.setHandler('addModule', function (sem, id, options) {
  return NUSMods.getMod(id).then(function (mod) {
    return selectedModulesControllers[sem - 1].selectedModules.add(mod, options);
  });
});
App.reqres.setHandler('removeModule', function (sem, id) {
  var selectedModules = selectedModulesControllers[sem - 1].selectedModules;
  return selectedModules.remove(selectedModules.get(id));
});
App.reqres.setHandler('isModuleSelected', function (sem, id) {
  return !!selectedModulesControllers[sem - 1].selectedModules.get(id);
});
App.reqres.setHandler('displayLessons', function (sem, id, display) {
  _.each(selectedModulesControllers[sem - 1].timetable.where({
    ModuleCode: id
  }), function (lesson) {
    lesson.set('display', display);
  });
});

App.reqres.setHandler('getBookmarks', function (callback) {
  if (!callback) { 
    return; 
  }
  localforage.getItem('bookmarks:bookmarkedModules', function (modules) {
    callback(modules);
  });
});
App.reqres.setHandler('addBookmark', function (id) {
  localforage.getItem('bookmarks:bookmarkedModules', function (modules) {
    if (!_.contains(modules, id)) {
      modules.push(id);
    }
    localforage.setItem('bookmarks:bookmarkedModules', modules);
  });
});
App.reqres.setHandler('deleteBookmark', function (id) {
  localforage.getItem('bookmarks:bookmarkedModules', function (modules) {
    var index = modules.indexOf(id);
    if (index > -1) {
      modules.splice(index, 1);
      localforage.setItem('bookmarks:bookmarkedModules', modules);
    }
  });
});

App.on('start', function () {
  var AppView = require('./common/views/AppView');
  var TimetableModuleCollection = require('./common/collections/TimetableModuleCollection');

  // header modules
  require('./modules');
  require('./timetable');
  // require('ivle');
  require('./preferences');

  // footer modules
  require('./about');
  require('./help');
  require('./support');

  new AppView();

  // Backbone.history.start returns false if no defined route matches
  // the current URL, so navigate to timetable by default.
  if (!Backbone.history.start({pushState: true})) {
    Backbone.history.navigate('timetable', {trigger: true, replace: true});
  }

  localforage.getItem('bookmarks:bookmarkedModules', function (modules) {
    if (!modules) {
      localforage.setItem('bookmarks:bookmarkedModules', []);
    }
  });
});

module.exports = App;
