'use strict';

var App = require('./app');

App.request('addNavigationItem', {
  name: 'NUSWhispers',
  icon: 'heart',
  url: 'https://nuswhispers.com/',
  target: '_blank',
  newLabel: true
});
