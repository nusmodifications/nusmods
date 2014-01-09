require.config({
  packages: [
    {
      name: 'underscore',
      location: '../bower_components/lodash-amd/underscore'
    }
  ],
  paths: {
    'backbone.babysitter': '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',
    'backbone.localstorage': '../bower_components/backbone.localstorage/backbone.localStorage',
    'backbone.marionette': '../bower_components/backbone.marionette/lib/core/amd/backbone.marionette',
    'backbone.picky': '../bower_components/backbone.picky/lib/amd/backbone.picky',
    'backbone.wreqr': '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
    backbone: '../bower_components/backbone/backbone',
    'bootstrap-button': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/button',
    'bootstrap-dropdown': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/dropdown',
    'bootstrap-modal': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/modal',
    'bootstrap-transition': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/transition',
    downloadify: '../bower_components/downloadify/src/downloadify',
    'hbs': '../bower_components/require-handlebars-plugin/hbs',
    jquery: '../bower_components/jquery/jquery',
    'jquery.ui.core': '../bower_components/jquery.ui/ui/jquery.ui.core',
    'jquery.ui.widget': '../bower_components/jquery.ui/ui/jquery.ui.widget',
    'jquery.ui.mouse': '../bower_components/jquery.ui/ui/jquery.ui.mouse',
    'jquery.ui.draggable': '../bower_components/jquery.ui/ui/jquery.ui.draggable',
    'jquery.ui.droppable': '../bower_components/jquery.ui/ui/jquery.ui.droppable',
    'jquery-ui-touch-punch-improved': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
    qtip2: '../bower_components/qtip2/jquery.qtip',
    select2: '../bower_components/select2/select2',
    spectrum: '../bower_components/spectrum/spectrum',
    swfobject: '../bower_components/swfobject/swfobject/swfobject',
    timetabledata: 'nus_timetable_data',
    zeroclipboard: '../bower_components/zeroclipboard/ZeroClipboard'
  },
  shim: {
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    'backbone.localstorage': [
      'backbone'
    ],
    'bootstrap-button': [
      'jquery'
    ],
    'bootstrap-dropdown': [
      'jquery'
    ],
    'bootstrap-modal': [
      'jquery'
    ],
    'bootstrap-transition': [
      'jquery'
    ],
    downloadify: [
      'jquery',
      'swfobject'
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
    ],
    spectrum: [
      'jquery'
    ],
    swfobject: {
      exports: 'swfobject'
    }
  }
});

require(['app'], function (App) {
  'use strict';

  App.start();
});
