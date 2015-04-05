'use strict';

var App = require('../app');

App.request('addNavigationItem', {
  name: 'Reddit@NUS',
  icon: 'reddit',
  url: 'http://www.reddit.com/r/nus',
  target: '_blank'
});
