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
    require(['module_finder', 'timetable_builder'], function () {
      Backbone.history.start();

      if (Backbone.history.fragment === '') {
        Backbone.history.navigate('timetable-builder', {trigger: true});
      }
    });

    localforage.getItem('theme', function (theme) {
      if (theme && theme !== 'default') {
        $('body').addClass('theme-' + theme);
        $('#theme').attr('href', 'http://bootswatch.com/' + theme + '/bootstrap.min.css');
      } else {
        localforage.setItem('theme', 'default');
      }
    });
  });

  return App;
});
