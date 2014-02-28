define([
  'backbone',
  'backbone.marionette',
  'common/views/AppView',
  'qtip2'
], function (Backbone, Marionette, AppView) {
  'use strict';

  var App = new Marionette.Application();

  App.addRegions({
    mainRegion: '.tab-pane'
  });

  var appView = new AppView();

  App.on('initialize:after', function () {
    require(['module_finder', 'timetable_builder'], function () {
      Backbone.history.start();

      if (Backbone.history.fragment === '') {
        Backbone.history.navigate('timetable-builder', {trigger: true});
      }
    });
  });

  return App;
});
