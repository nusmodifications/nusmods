define([
  'backbone',
  'backbone.marionette',
  'common/collections/NavigationCollection',
  'common/controllers/SelectedModulesController',
  'common/views/NavigationView',
  'localforage',
  'nusmods',
  'qtip2'
], function (Backbone, Marionette, NavigationCollection,
             SelectedModulesController, NavigationView,
             localforage, NUSMods) {
  'use strict';

  var App = new Marionette.Application();

  App.addRegions({
    mainRegion: '.content',
    navigationRegion: 'nav',
    selectRegion: '.navbar-form'
  });

  var navigationCollection = new NavigationCollection();
  var navigationView = new NavigationView({collection: navigationCollection});
  App.navigationRegion.show(navigationView);

  App.reqres.setHandler('addNavigationItem', function (navigationItem) {
    return navigationCollection.add(navigationItem);
  });

  var selectedModulesController = new SelectedModulesController();
  App.reqres.setHandler('selectedModules', function () {
    return selectedModulesController.selectedModules;
  });
  App.reqres.setHandler('addModule', function (id) {
    return NUSMods.getMod(id).then(function (mod) {
      return selectedModulesController.selectedModules.add(mod);
    });
  });
  App.reqres.setHandler('removeModule', function (id) {
    var selectedModules = selectedModulesController.selectedModules;
    return selectedModules.remove(selectedModules.get(id));
  });
  App.reqres.setHandler('isModuleSelected', function (id) {
    return !!selectedModulesController.selectedModules.get(id);
  });

  App.on('start', function () {
    require([
      'common/views/AppView',
      // 'ivle',
      'modules',
      'timetable_builder',
      'preferences'
    ], function (AppView) {
      Backbone.history.start({pushState: true});

      new AppView();

      if (Backbone.history.fragment === '') {
        Backbone.history.navigate('timetable-builder', {trigger: true});
      }
    });

    var $body = $('body');
    ['theme', 'mode'].forEach(function (property) {
      localforage.getItem(property, function (value) {
        if (!value) {
          localforage.setItem(property, 'default');
        }
        $body.addClass(property + '-' + value);
        $body.attr('data-' + property, value);
        if (property === 'mode' && value !== 'default') {
          $('#mode').attr('href', '/styles/' + value + '.min.css');
        }
      });
    });
  });

  return App;
});
