'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var BookmarkItemView = require('./BookmarkItemView');
var template = require('../templates/bookmarks.hbs');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<p>No bookmarks.</p>')
});

module.exports = Marionette.CompositeView.extend({
  className: 'nm-bookmarks',
  childView: BookmarkItemView,
  childViewContainer: 'ul',
  emptyView: EmptyView,
  template: template
});
