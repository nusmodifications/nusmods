'use strict';

var Marionette = require('backbone.marionette');
var NavigationItemView = require('./NavigationItemView');
require('bootstrap/collapse');

module.exports = Marionette.CollectionView.extend({
  tagName: 'ul',
  className: 'nav navbar-nav navbar-right',
  childView: NavigationItemView
});
