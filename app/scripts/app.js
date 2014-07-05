define([
  'underscore',
  'backbone',
  'backbone.marionette',
  'common/collections/NavigationCollection',
  'common/controllers/SelectedModulesController',
  'common/views/NavigationView',
  'localforage',
  'nusmods',
  'json!config.json',
  'qtip2'
], function (_, Backbone, Marionette, NavigationCollection,
             SelectedModulesController, NavigationView,
             localforage, NUSMods, config) {
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

  NUSMods.setConfig(config);

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

  localforage.getItem('selectedModules', function (selectedModules) {
    _.each(selectedModules, function (module) {
      App.request('addModule', module.ModuleCode, module);
    });
  });

  App.on('start', function () {
    require([
      'common/views/AppView',
      // 'ivle',
      'modules',
      'timetable',
      'preferences',
      'help'
    ], function (AppView) {
      Backbone.history.start({pushState: true});

      new AppView();

      if (Backbone.history.fragment === '') {
        Backbone.history.navigate('timetable', {trigger: true});
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
  });

  return App;
});
