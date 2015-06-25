'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var NewsFeedItemView = require('./NewsFeedItemView');
var template = require('../templates/news_feed.hbs');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div class="col-md-12">Loading...<br></div>')
});

module.exports = Marionette.CompositeView.extend({
  className: 'nm-news-feed',
  childView: NewsFeedItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: template
});
