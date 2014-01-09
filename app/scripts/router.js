define([
  // Application.
  'app',
  'backbone'
],

function(app, Backbone) {
  'use strict';

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      '': 'index',
      'modules': 'modules',
      'timetable(/*lessons)': 'timetable'
    },

    index: function() {
      this.navigate('timetable', {trigger: true});
    },

    modules: function() {
      $('a[href="#module-finder"]').click();
    },

    timetable: function() {
      $('a[href="#timetable-builder"]').click();

    }
  });

  return Router;

});
