require.config({
  packages: [
    'module_finder',
    'timetable_builder',
    {
      name: 'underscore',
      location: '../bower_components/lodash-amd/underscore'
    }
  ],
  paths: {
    'backbone.babysitter': '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',
    'backbone.localforage': '../bower_components/localforage/dist/backbone.localforage.min',
    'backbone.marionette': '../bower_components/backbone.marionette/lib/core/amd/backbone.marionette',
    'backbone.picky': '../bower_components/backbone.picky/lib/amd/backbone.picky',
    'backbone.wreqr': '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
    'bootstrap-button': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/button',
    'bootstrap-dropdown': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/dropdown',
    'jquery-ui-touch-punch-improved': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
    'jquery.ui.core': '../bower_components/jquery.ui/ui/jquery.ui.core',
    'jquery.ui.draggable': '../bower_components/jquery.ui/ui/jquery.ui.draggable',
    'jquery.ui.droppable': '../bower_components/jquery.ui/ui/jquery.ui.droppable',
    'jquery.ui.mouse': '../bower_components/jquery.ui/ui/jquery.ui.mouse',
    'jquery.ui.widget': '../bower_components/jquery.ui/ui/jquery.ui.widget',
    backbone: '../bower_components/backbone/backbone',
    hbs: '../bower_components/require-handlebars-plugin/hbs',
    jquery: '../bower_components/jquery/dist/jquery',
    json: '../bower_components/requirejs-plugins/src/json',
    localforage: '../bower_components/localforage/dist/localforage.min',
    qtip2: '../bower_components/qtip2/jquery.qtip',
    select2: '../bower_components/select2/select2',
    zeroclipboard: '../bower_components/zeroclipboard/ZeroClipboard'
  },
  shim: {
    'backbone.localforage': [
      'backbone'
    ],
    'bootstrap-button': [
      'jquery'
    ],
    'bootstrap-dropdown': [
      'jquery'
    ],
    'jquery.ui.core': [
      'jquery'
    ],
    'jquery.ui.widget': [
      'jquery.ui.core'
    ],
    'jquery.ui.mouse': [
      'jquery.ui.widget'
    ],
    'jquery.ui.draggable': [
      'jquery.ui.mouse'
    ],
    'jquery.ui.droppable': [
      'jquery.ui.draggable'
    ],
    'jquery-ui-touch-punch-improved': [
      'jquery.ui.mouse'
    ],
    qtip2: [
      'jquery'
    ],
    select2: [
      'jquery'
    ]
  }
});

require(['app'], function (App) {
  'use strict';

  App.start();
});
