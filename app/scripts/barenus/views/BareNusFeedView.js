'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var BareNusFeedItemView = require('./BareNusFeedItemView');
var template = require('../templates/barenus_feed.hbs');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div class="col-md-12">Loading...<br></div>')
});

module.exports = Marionette.CompositeView.extend({
  className: 'nm-bn-feed',
  childView: BareNusFeedItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: template
});
