define([
  'backbone',
  'backbone.marionette',
  'router',
  'views/AppView',
  'views/TimetableBuilderView',
  'timetabledata',
  'bootstrap-button',
  'bootstrap-dropdown',
  'bootstrap-modal',
  'bootstrap-transition',
  'qtip2'
], function (Backbone, Marionette, Router, AppView, TimetableBuilderView) {
  'use strict';

  var App = new Marionette.Application();

  App.addInitializer(function () {
    var appView = new AppView();
    var timetableBuilderView = new TimetableBuilderView();
    App.router = new Router();
    Backbone.history.start();
  });

  return App;
});
