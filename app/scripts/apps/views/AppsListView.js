'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var AppsListItemView = require('./AppsListItemView');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div class="col-md-12">Loading...<br></div>')
});

module.exports = Marionette.CompositeView.extend({
  className: 'nm-apps-list',
  childView: AppsListItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: _.template('<div class="row"></div>')
});
