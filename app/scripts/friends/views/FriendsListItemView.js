'use strict';

var _ = require('underscore');
var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/friends_list_item.hbs');

module.exports = Marionette.LayoutView.extend({
  tagName: 'div',
  className: 'media',
  template: template,
  events: {
    'click .js-delete-friend-timetable': 'deleteFriendTimetable'
  },
  onShow: function () {  
    
  },
  generateTimetableFromQueryString: function (name, semester, queryString) { 
    
  },
  deleteFriendTimetable: function () {
    var friendsListCollection = this.model.collection;
    friendsListCollection.remove(this.model);
    var friendsListData = _.pluck(friendsListCollection.models, 'attributes');
    localforage.setItem('timetable:friends', friendsListData);
  }
});
