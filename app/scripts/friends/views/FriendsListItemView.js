'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var template = require('../templates/friends_list_item.hbs');
var localforage = require('localforage');

module.exports = Marionette.LayoutView.extend({
  tagName: 'div',
  className: 'media nm-friends-list-item',
  template: template,
  events: {
    'click': 'selectFriend',
    'click .js-nm-friends-delete': 'deleteFriendTimetable',
    'change .js-nm-friends-select-checkbox': 'toggleFriendSelection'
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
    var choice = window.confirm('Do you really want to delete ' + this.model.get('name') + '\'s timetable?');
    if (choice) {
      var friendsListCollection = this.model.collection;
      friendsListCollection.remove(this.model);
      friendsListCollection.trigger('change');
      var attributes = _.pluck(friendsListCollection.models, 'attributes');
      var friendsListData = _.pick(attributes, 'name', 'queryString', 'selected', 'semester');
      localforage.setItem('timetable:friends', friendsListData);
    }
  }
});
