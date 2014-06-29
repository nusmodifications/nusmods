define([
  'backbone',
  'backbone.marionette',
  'common/collections/NavigationCollection',
  'common/controllers/SelectedModulesController',
  'common/views/AppView',
  'common/views/NavigationView',
  'common/views/SelectView',
  'localforage',
  'qtip2'
], function (Backbone, Marionette, NavigationCollection,
             SelectedModulesController, AppView, NavigationView, SelectView,
             localforage) {
  'use strict';

  var App = new Marionette.Application();

  App.addRegions({
    mainRegion: '.content',
    navigationRegion: 'nav'
  });

  new AppView();

  var navigationCollection = new NavigationCollection();
  var navigationView = new NavigationView({collection: navigationCollection});
  App.navigationRegion.show(navigationView);

  App.reqres.setHandler('addNavigationItem', function (navigationItem) {
    return navigationCollection.add(navigationItem);
  });

  var selectedModulesController = new SelectedModulesController();
  App.reqres.setHandler('selectedModules', function(){
    return selectedModulesController.selectedModules;
  });
  App.commands.setHandler('removeModule', function (id) {
    var selectedModules = selectedModulesController.selectedModules;
    selectedModules.remove(selectedModules.get(id));
  });

  new SelectView({
    collection: App.request('selectedModules')
  });

  App.on('start', function () {
    require(['ivle', 'modules', 'timetable_builder', 'preferences'], function () {
      Backbone.history.start();

      if (Backbone.history.fragment === '') {
        Backbone.history.navigate('timetable-builder', {trigger: true});
      }
    });

    var $body = $('body');
    ['theme', 'mode'].forEach(function (property) {
      localforage.getItem(property, function (value) {
        if (value) {
          $body.addClass(property + '-' + value);
          $body.attr('data-' + property, value);
          if (property === 'mode' && value !== 'default') {
            $('#mode').attr('href', 'styles/' + value + '.min.css');
          }
        } else {
          localforage.setItem(property, 'default');
        }
      });
    });
  });

  return App;
});
