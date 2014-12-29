'use strict';

var App = require('../app');

var navigationItem = App.request('addNavigationItem', {
  name: 'Blog',
  icon: 'newspaper-o',
  url: 'http://blog.nusmods.com'
});
