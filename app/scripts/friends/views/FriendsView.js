'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var NUSMods = require('../../nusmods');

var template = require('../templates/friends.hbs');
var addFriendTimetableModalTemplate = require('../templates/friend_add_modal.hbs');
var timify = require('../../common/utils/timify');
var TimetableFlexView = require('../../timetable_flex/views/TimetableFlexView');
var FriendsListView = require('./FriendsListView');
var FriendsSelectedListView = require('./FriendsSelectedListView');
var config = require('../../common/config');

require('bootstrap/tooltip');
require('bootstrap/popover');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    var that = this;
    NUSMods.getAllTimetable(config.semester).then(function (data) {
      console.log(data);
      that.modules = {};
      _.each(data, function (module) {
        that.modules[module.ModuleCode] = module;
      });
    });
  },
  template: template,
  regions: {
    friendsListRegion: '.nm-friends-list',
    friendsSelectedListRegion: '.nm-friends-selected-list',
    timetableRegion: '.nm-friends-timetable'
  },
  ui: {
    'addButton': '.js-nm-friends-add-popover'
  },
  onShow: function () {
    var that = this;
    localforage.getItem('timetable:friends', function (data) {
      that.friendsListCollection = new Backbone.Collection(data);
      that.friendsListView = new FriendsListView({collection: that.friendsListCollection});
      that.friendsListRegion.show(that.friendsListView);

      that.friendsSelectedListView = new FriendsSelectedListView();
      that.friendsSelectedListRegion.show(that.friendsSelectedListView);
      that.showSelectedFriendsList();

      that.friendsListCollection.on('change', function () {
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
    var friendsSelectedList = this.friendsListCollection.where({selected: true});
    this.friendsSelectedListView.collection = new Backbone.Collection(friendsSelectedList);
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
    console.log(timetableQueryString);
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
    console.log('updateDisplayedTimetable');
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
