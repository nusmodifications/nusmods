'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var NUSMods = require('./nusmods');
var NavigationCollection = require('./common/collections/NavigationCollection');
var NavigationView = require('./common/views/NavigationView');
var Promise = require('bluebird'); // jshint ignore:line
var SelectedModulesController = require('./common/controllers/SelectedModulesController');
var TimetableModuleCollection = require('./common/collections/TimetableModuleCollection');
var _ = require('underscore');
var $ = require('jquery');
var config = require('./common/config');
var localforage = require('localforage');
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
  navigationRegion: '#nav',
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
  return selectedModulesControllers[sem - 1].selectedModules.add({
    ModuleCode: id,
    Semester: sem
  }, options);
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

var bookmarkedModulesNamespace = config.namespaces.bookmarkedModules + ':';

App.reqres.setHandler('getBookmarks', function (callback) {
  if (!callback) {
    return;
  }
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    callback(modules);
  });
});
App.reqres.setHandler('addBookmark', function (id) {
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    if (!_.contains(modules, id)) {
      modules.push(id);
    }
    localforage.setItem(bookmarkedModulesNamespace, modules);
  });
});
App.reqres.setHandler('deleteBookmark', function (id) {
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    var index = modules.indexOf(id);
    if (index > -1) {
      modules.splice(index, 1);
      localforage.setItem(bookmarkedModulesNamespace, modules);
    }
  });
});

App.on('start', function () {
  var AppView = require('./common/views/AppView');

  new Marionette.AppRouter({
    routes: {
      '*default': function () {
        Backbone.history.navigate('timetable', {trigger: true, replace: true});
      }
    }
  });

  // navigation menu modules
  require('./timetable');
  require('./modules');
  require('./venues');
  // require('./friends');
  require('./nuswhispers');
  require('./news');
  require('./preferences');
  require('./apps');
  require('./blog');
  require('./reddit');
  // require('ivle');

  // footer modules
  require('./about');
  require('./contribute');
  require('./help');
  require('./contact');

  Promise.all(_.map(_.range(1, 5), function(semester) {
    var semTimetableFragment = config.semTimetableFragment(semester);
    return localforage.getItem(semTimetableFragment + ':queryString')
      .then(function (savedQueryString) {
      if ('/' + semTimetableFragment === window.location.pathname) {
        var queryString = window.location.search.slice(1);
        if (queryString) {
          if (savedQueryString !== queryString) {
            // If initial query string does not match saved query string,
            // timetable is shared.
            App.request('selectedModules', semester).shared = true;
          }
          // If there is a query string for timetable, return so that it will
          // be used instead of saved query string.
          return;
        }
      }
      var selectedModules = TimetableModuleCollection.fromQueryStringToJSON(savedQueryString);
      return Promise.all(_.map(selectedModules, function (module) {
        return App.request('addModule', semester, module.ModuleCode, module);
      }));
    });
  }).concat([NUSMods.generateModuleCodes()])).then(function () {
    new AppView();

    Backbone.history.start({pushState: true});
  });

  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    if (!modules) {
      localforage.setItem(bookmarkedModulesNamespace, []);
    }
  });

  // For sidebar menu
  require('bootstrap/tooltip');
  $('[data-toggle="tooltip"]').tooltip();

});

module.exports = App;
