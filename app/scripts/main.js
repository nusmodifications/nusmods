'use strict';

var Promise = require('bluebird'); // jshint ignore:line
var analytics = require('./analytics');
var localforage = require('localforage');

var $body = $('body');
Promise.all(['theme', 'mode'].map(function (property) {
  return localforage.getItem(property).then(function (value) {
    if (!value) {
      value = 'default';
      localforage.setItem(property, value);
    } else {
      // For non-first time users, we want to see what modes/themes they are using.
      if (property === 'theme') {
        // Set theme custom dimension
        analytics.set('dimension3', value);
      }
      if (property === 'mode') {
        // Set mode custom dimension
        analytics.set('dimension4', value);
      }
    }
    $body.addClass(property + '-' + value);
    $body.attr('data-' + property, value);
    if (property === 'mode' && value !== 'default') {
      $('#mode').attr('href', '/styles/' + value + '.min.css');
    }
  });
})).then(analytics.flush);

var App = require('./app');
App.start();
