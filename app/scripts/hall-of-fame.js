'use strict';

var App = require('./app');

App.request('addNavigationItem', {
  name: 'Hall of Fame',
  icon: 'trophy',
  url: 'http://awards.nusmods.com',
  target: '_blank',
  newLabel: true
});
