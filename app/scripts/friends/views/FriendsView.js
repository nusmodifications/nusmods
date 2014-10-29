'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/friends.hbs');
var addFriendTimetableModalTemplate = require('../templates/friend_add_modal.hbs');
var timify = require('../../common/utils/timify');
var TimetableFlexView = require('../../timetable_flex/views/TimetableFlexView');
var FriendsListView = require('./FriendsListView');

require('bootstrap/tooltip');
require('bootstrap/popover');

module.exports = Marionette.LayoutView.extend({
  template: template,
  regions: {
    friendsListRegion: '.nm-friends-list',
    timetableRegion: '.nm-friends-timetable'
  },
  ui: {
    'addButton': '.js-add-timetable-popover'
  },
  onShow: function () {
    var that = this; 
    localforage.getItem('timetable:friends', function (data) {
      that.friendsListCollection = new Backbone.Collection(data);
      var friendsListView = new FriendsListView({collection: that.friendsListCollection});
      that.friendsListRegion.show(friendsListView);
    });
    this.ui.addButton.popover({
      html: true,
      placement: 'bottom',
      content: addFriendTimetableModalTemplate()
    });
  },
  events: {
    'click .js-add-friend-timetable': 'addFriendTimetable',
    'click .js-merge-timetables': 'mergeTimetables'
  },
  addFriendTimetable: function () {
    var that = this;
    var timetableUrl = $('#url').val();
    var friendName = $('#name').val();
    this.getFinalTimetableUrl(timetableUrl, function (data) {
      that.ui.addButton.popover('hide');
      that.insertFriendTimetableFromUrl(friendName, data.redirectedUrl);
    });
  },
  getFinalTimetableUrl: function (timetableUrl, callback) {
    $.ajax({
      url: 'http://nusmods.com/redirect.php',
      type: 'GET',
      crossDomain: true,
      dataType: 'json',
      data: {
        timetable: timetableUrl
      },
      success: function (result) {
        if (callback) {
          callback(result);
        }
      },
      error: function (xhr, status, error) {
        alert(status);
      }
    });
  },
  insertFriendTimetableFromUrl: function (name, timetableUrl) {
    var urlFragments = timetableUrl.split('/');
    var queryFragments = urlFragments.slice(-1)[0].split('?');
    var semester = parseInt(queryFragments[0].slice(3));
    var timetableQueryString = queryFragments[1];
    console.log(timetableQueryString);
    this.friendsListCollection.add({
      name: name,
      semester: semester,
      queryString: timetableQueryString
    });

    var friendsData = _.pluck(this.friendsListCollection.models, 'attributes');
    localforage.setItem('timetable:friends', friendsData);
  },
  mergeTimetables: function () {
    var mergedQueryString = _.pluck(_.pluck(this.friendsListCollection.models, 'attributes'), 'queryString').join('&');
    // console.log(mergedQueryString);
    var model = new Backbone.Model({
      name: 'Merged Timetable',
      semester: 1,
      queryString: mergedQueryString
    });

    // this.timetableRegion.show(new TimetableFlexView({
    //   model: venueTimetableModel
    // }));
  }
});
