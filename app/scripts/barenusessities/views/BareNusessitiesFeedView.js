'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var BareNusessitiesFeedItemView = require('./BareNusessitiesFeedItemView');
var template = require('../templates/barenusessities_feed.hbs');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div class="col-md-12">Loading...<br></div>')
});

module.exports = Marionette.CompositeView.extend({
  className: 'nm-bn-feed',
  childView: BareNusessitiesFeedItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: template
});
