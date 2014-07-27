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

var selectedModulesController = new SelectedModulesController();
App.reqres.setHandler('selectedModules', function () {
  return selectedModulesController.selectedModules;
});
App.reqres.setHandler('addModule', function (id, options) {
  return NUSMods.getMod(id).then(function (mod) {
    return selectedModulesController.selectedModules.add(mod, options);
  });
});
App.reqres.setHandler('removeModule', function (id) {
  var selectedModules = selectedModulesController.selectedModules;
  return selectedModules.remove(selectedModules.get(id));
});
App.reqres.setHandler('isModuleSelected', function (id) {
  return !!selectedModulesController.selectedModules.get(id);
});
App.reqres.setHandler('displayLessons', function (id, display) {
  _.each(selectedModulesController.timetable.where({
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

  localforage.getItem(config.semTimetableFragment() +
    ':queryString').then(function (savedQueryString) {
    if ('/' + config.semTimetableFragment() === window.location.pathname) {
      var queryString = window.location.search.slice(1);
      if (queryString) {
        if (savedQueryString !== queryString) {
          // If initial query string does not match saved query string,
          // timetable is shared.
          selectedModulesController.selectedModules.shared = true;
        }
        // If there is a query string for timetable, return so that it will
        // be used instead of saved query string.
        return;
      }
    }
    var selectedModules = TimetableModuleCollection.fromQueryStringToJSON(savedQueryString);
    return $.when.apply($, _.map(selectedModules, function (module) {
      return App.request('addModule', module.ModuleCode, module).promise;
    }));
  }).then(function () {
    new AppView();

    // Backbone.history.start returns false if no defined route matches
    // the current URL, so navigate to timetable by default.
    if (!Backbone.history.start({pushState: true})) {
      Backbone.history.navigate('timetable', {trigger: true, replace: true});
    }
  });

  var $body = $('body');
  ['theme', 'mode'].forEach(function (property) {
    localforage.getItem(property, function (value) {
      if (!value) {
        value = 'default';
        localforage.setItem(property, value);
      }
      $body.addClass(property + '-' + value);
      $body.attr('data-' + property, value);
      if (property === 'mode' && value !== 'default') {
        $('#mode').attr('href', '/styles/' + value + '.min.css');
      }
    });
  });

  localforage.getItem('bookmarks:bookmarkedModules', function (modules) {
    if (!modules) {
      localforage.setItem('bookmarks:bookmarkedModules', []);
    }
  });
});

module.exports = App;
