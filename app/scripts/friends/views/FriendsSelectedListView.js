'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var FriendsSelectedListItemView = require('./FriendsSelectedListItemView');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div>No friends selected.</div>')
});

module.exports = Marionette.CompositeView.extend({
  childView: FriendsSelectedListItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: _.template('<div></div>'),
  initialize: function () {    
  }
});
