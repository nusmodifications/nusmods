'use strict';

var App = require('../app');

App.request('addNavigationItem', {
  name: 'Blog',
  icon: 'rss',
  url: 'http://blog.nusmods.com',
  target: '_blank'
});
