require.config({
  packages: [
    'module_finder',
    'timetable_builder',
    'preferences',
    'corspedia',
    {
      name: 'underscore',
      location: '../bower_components/lodash-amd/underscore'
    }
  ],
  paths: {
    'backbone.babysitter': '../bower_components/backbone.babysitter/lib/backbone.babysitter',
    'backbone.marionette': '../bower_components/backbone.marionette/lib/core/amd/backbone.marionette',
    'backbone.picky': '../bower_components/backbone.picky/lib/amd/backbone.picky',
    'backbone.wreqr': '../bower_components/backbone.wreqr/lib/backbone.wreqr',
    'jquery-ui': '../bower_components/jquery.ui/ui',
    'jquery-ui-touch-punch-improved': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
    backbone: '../bower_components/backbone/backbone',
    bootstrap: '../bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap',
    hbs: '../bower_components/require-handlebars-plugin/hbs',
    jquery: '../bower_components/jquery/dist/jquery',
    json: '../bower_components/requirejs-plugins/src/json',
    localforage: '../bower_components/localforage/dist/localforage.min',
    qtip2: '../bower_components/qtip2/jquery.qtip',
    select2: '../bower_components/select2/select2',
    zeroclipboard: '../bower_components/zeroclipboard/dist/ZeroClipboard'
  },
  shim: {
    'bootstrap/button': [
      'jquery'
    ],
    'bootstrap/collapse': [
      'bootstrap/transition',
      'jquery'
    ],
    'bootstrap/dropdown': [
      'jquery'
    ],
    'bootstrap/transition': [
      'jquery'
    ],
    'jquery-ui-touch-punch-improved': [
      'jquery-ui/mouse'
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
