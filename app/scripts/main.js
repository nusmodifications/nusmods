'use strict';

var localforage = require('localforage');

var $body = $('body');
['theme', 'mode'].forEach(function (property) {
  localforage.getItem(property, function (value) {
    if (!value) {
      value = 'default';
      localforage.setItem(property, value);
    } else {
      // For non-first time users, we want to see what modes/themes they are using.
      if (property === 'theme') {
        ga('send', 'event', 'Theme', 'Load page with theme', value);
      }
      if (property === 'mode') {
        ga('send', 'event', 'Mode', 'Load page with mode', value);
      }
    }
    $body.addClass(property + '-' + value);
    $body.attr('data-' + property, value);
    if (property === 'mode' && value !== 'default') {
      $('#mode').attr('href', '/styles/' + value + '.min.css');
    }
  });
});

var App = require('./app');
App.start();
