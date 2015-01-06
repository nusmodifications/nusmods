'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var FriendsListItemView = require('./FriendsListItemView');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div class="media nm-friends-list-item">No friends selected. Click the <i class="fa fa-plus"></i> icon to add your friends!</div>')
});

module.exports = Marionette.CompositeView.extend({
  childView: FriendsListItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: _.template('<div></div>')
});
