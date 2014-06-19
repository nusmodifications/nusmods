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
    require(['module_finder', 'timetable_builder', 'corspedia', 'preferences'], function () {
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
