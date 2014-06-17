define([
  'backbone',
  'backbone.marionette',
  'common/collections/NavigationCollection',
  'common/views/AppView',
  'common/views/NavigationView',
  'localforage',
  'qtip2'
], function (Backbone, Marionette, NavigationCollection, AppView,
             NavigationView, localforage) {
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

  App.on('initialize:after', function () {
    require(['module_finder', 'timetable_builder', 'preferences'], function () {
      Backbone.history.start();

      if (Backbone.history.fragment === '') {
        Backbone.history.navigate('timetable-builder', {trigger: true});
      }
    });

    localforage.getItem('mode', function (mode) {
      if (mode && mode !== 'default') {
        $('body').addClass('mode-' + mode);
        $('#mode').attr('href', 'styles/' + mode + '.min.css');
      } else {
        localforage.setItem('mode', 'default');
      }
    });
  });

  return App;
});
