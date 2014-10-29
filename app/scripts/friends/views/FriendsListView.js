'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var FriendsListItemView = require('./FriendsListItemView');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div><p>No friends added.</p></div>')
});

module.exports = Marionette.CompositeView.extend({
  childView: FriendsListItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: _.template('<div></div>')
});
