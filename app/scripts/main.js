'use strict';

var localforage = require('localforage');

var $body = $('body');
['theme', 'mode'].forEach(function (property) {
  localforage.getItem(property, function (value) {
    if (!value) {
      value = 'default';
      localforage.setItem(property, value);
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
