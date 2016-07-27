'use strict';

var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var Raven = require('raven-js');
var config = require('./common/config');
var _ = require('underscore');
var preferencesNamespace = config.namespaces.preferences + ':';

Raven.config('https://44876a16654343e5a30acfcaa5144806@app.getsentry.com/27278', {
  whitelistUrls: ['nusmods.com/scripts/']
}).install();

var Promise = require('bluebird'); // jshint ignore:line
var analytics = require('./analytics');
var localforage = require('localforage');

var $body = $('body');
require('../favicon-16.png');
require('../favicon-32.png');
require('../favicon-64.png');
require('../favicon-96.png');
require('../favicon-160.png');
require('../favicon-196.png');
require('../opensearch.xml');
require('../images/logo.png');
require('../images/logo-white.png');
require('qtip2/dist/jquery.qtip.css');
require('select2/select2.css');
require('animate.css/animate.min.css');
require('font-awesome/fonts/fontawesome-webfont.eot');
require('font-awesome/fonts/fontawesome-webfont.svg');
require('font-awesome/fonts/fontawesome-webfont.ttf');
require('font-awesome/fonts/fontawesome-webfont.woff');
require('font-awesome/fonts/fontawesome-webfont.woff2');

require('../.htaccess');
require('../favicon.ico');
require('../short_url.php');
require('../html.php');
require('../ical.php');
require('../jpg.php');
require('../news.php');
require('../pdf.php');
require('../redirect.php');
require('../xls.php');

require('./disqus-count.js');

localforage.getItem('migratedPreferences').then(function (value) {
  if (!value) {
    Promise.all(_.keys(config.defaultPreferences).map(function (property) {
      return localforage.getItem(property).then(function (value) {
        // Migration from old preferences to new namespaced preferencs.
        value = value ? value : config.defaultPreferences[property];
        localforage.setItem(preferencesNamespace + property, value);
      });
    }));
    localforage.setItem('migratedPreferences', true);
  }
});

Promise.all(['theme', 'mode'].map(function (property) {
  return localforage.getItem(preferencesNamespace + property).then(function (value) {
    value = value ? value : config.defaultPreferences[property];
    $body.addClass(property + '-' + value);
    $body.attr('data-' + property, value);
    if (property === 'mode' && value !== 'default') {
      $('#mode').attr('href', '/styles/' + value + '.min.css');
    }
  });
})).then(analytics.flush);

var App = require('./app');
App.start();
