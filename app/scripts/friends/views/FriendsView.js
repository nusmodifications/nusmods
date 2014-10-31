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
var FriendsSelectedListView = require('./FriendsSelectedListView');
var FriendModel = require('../models/FriendModel');
var config = require('../../common/config');

require('bootstrap/tooltip');
require('bootstrap/popover');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
  },
  template: template,
  regions: {
    friendsListRegion: '.nm-friends-list',
    friendsSelectedListRegion: '.nm-friends-selected-list',
    timetableRegion: '.nm-friends-timetable'
  },
  ui: {
    'addButton': '.js-nm-friends-add-button'
  },
  onShow: function () {
    var that = this;
    localforage.getItem('timetable:friends', function (data) {
      var friendsList = _.map(data, function (friend) {
        return new FriendModel(friend);
      });
      that.friendsListCollection = new Backbone.Collection(friendsList);
      that.friendsListView = new FriendsListView({collection: that.friendsListCollection});
      that.friendsListRegion.show(that.friendsListView);

      var friendsSelectedList = that.friendsListCollection.where({selected: true});
      that.friendsSelectedListView = new FriendsSelectedListView();
      that.friendsSelectedListView.collection = new Backbone.Collection(friendsSelectedList);
      that.friendsSelectedListRegion.show(that.friendsSelectedListView);
      that.showSelectedFriendsList();
      that.updateDisplayedTimetable();

      that.friendsListCollection.on('change', function () {
        var friendsSelectedList = that.friendsListCollection.where({selected: true});
        that.friendsSelectedListView.collection = new Backbone.Collection(friendsSelectedList);
        that.updateDisplayedTimetable();
        that.showSelectedFriendsList();
        that.friendsListView.render();
      });

    });
    this.ui.addButton.popover({
      html: true,
      placement: 'bottom',
      content: addFriendTimetableModalTemplate()
    });
  },
  events: {
    'click .js-nm-friends-add': 'addFriendTimetable'
  },
  showSelectedFriendsList: function () {
    this.friendsSelectedListView.render();
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
    this.friendsListCollection.add({
      name: name,
      semester: semester,
      queryString: timetableQueryString,
      selected: false
    });

    var friendsData = _.pluck(this.friendsListCollection.models, 'attributes');
    localforage.setItem('timetable:friends', friendsData);
  },
  updateDisplayedTimetable: function () {

    var lessons;
    var selectedFriends = _.each(this.friendsSelectedListView.collection.models, function (person) {
      lessons = _.map(person.get('moduleInformation').timetable.models, function (lesson) {
        return lesson.attributes;
      });
    });

    console.log('lessons', lessons)
    var TimetableFlexModel = new Backbone.Model({
      lessonsList: lessons,
      mergeMode: true
    });

    this.timetableRegion.show(new TimetableFlexView({
      model: TimetableFlexModel
    }));
  },
  mergeTimetables: function () {
    var mergedQueryString = _.pluck(_.pluck(this.friendsListCollection.models, 'attributes'), 'queryString').join('&');
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
