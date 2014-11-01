'use strict';

var _ = require('underscore');
var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/friends_list_item.hbs');

module.exports = Marionette.LayoutView.extend({
  tagName: 'div',
  className: 'media nm-friends-list-item',
  template: template,
  events: {
    'click': 'selectFriend',
    'click .js-nm-friends-delete': 'deleteFriendTimetable',
    'change .js-nm-friends-select-checkbox': 'toggleFriendSelection'
  },
  onShow: function () {  
    
  },
  selectFriend: function () {
    _.each(this.model.collection.models, function (model) {
      model.set('selected', false);
    });
    this.model.set('selected', true);
  },
  toggleFriendSelection: function (e) {
    e.preventDefault();
    e.stopPropagation();
    var selected = this.model.get('selected');
    this.model.set('selected', !selected);
  },
  deleteFriendTimetable: function (e) {
    e.preventDefault();
    e.stopPropagation();
    var friendsListCollection = this.model.collection;
    friendsListCollection.remove(this.model);
    friendsListCollection.trigger('change');
    var friendsListData = _.pick(_.pluck(friendsListCollection.models, 'attributes'), 'name', 'queryString', 'selected', 'semester');
    localforage.setItem('timetable:friends', friendsListData);
  }
});
