'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var localforage = require('localforage');

var template = require('../templates/friends.hbs');
var addFriendTimetableModalTemplate = require('../templates/friend_add_modal.hbs');
var timify = require('../../common/utils/timify');
var TimetableFlexView = require('../../timetable_flex/views/TimetableFlexView');
var FriendsListView = require('./FriendsListView');
var FriendsSelectedListView = require('./FriendsSelectedListView');
var FriendModel = require('../models/FriendModel');
var FriendsNotGoingSchoolView = require('./FriendsNotGoingSchoolView');
var config = require('../../common/config');

require('bootstrap/tooltip');
require('bootstrap/popover');

var USER_NAME = 'Me';

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
  },
  template: template,
  regions: {
    friendsListRegion: '.nm-friends-list',
    friendsSelectedListRegion: '.nm-friends-selected-list',
    friendsNotGoingSchoolRegion: '.nm-friends-not-going-school',
    timetableRegion: '.nm-friends-timetable'
  },
  ui: {
    'addButton': '.js-nm-friends-add-button'
  },
  onShow: function () {
    var that = this;
    var userTimetableUrl;
    localforage.getItem(config.semTimetableFragment(config.semester) + ':queryString').then(function (data) {
      userTimetableUrl = data;
    }).then(function () {
      localforage.getItem('timetable:friends', function (data) {
        // Get current user's information
        var userInfo = {
          name: USER_NAME,
          queryString: userTimetableUrl,
          selected: true,
          semester: config.semester
        };
        if (!data) {
          data = [userInfo];
        } else {
          data.unshift(userInfo);
        }
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
    var friendName = $('#name').val();
    var timetableUrl = $('#url').val();
    this.getFinalTimetableUrl(timetableUrl, function (data) {
      that.ui.addButton.popover('hide');
      that.insertFriendTimetableFromUrl(friendName, data.redirectedUrl);
    });
  },
  getFinalTimetableUrl: function (timetableUrl, callback) {
    $.ajax({
      url: 'https://nusmods.com/redirect.php',
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
      error: function (xhr, status) {
        window.alert(status);
      }
    });
  },
  insertFriendTimetableFromUrl: function (name, timetableUrl) {
    var urlFragments = timetableUrl.split('/');
    var queryFragments = urlFragments.slice(-1)[0].split('?');
    var semester = parseInt(queryFragments[0].slice(3));
    var timetableQueryString = queryFragments[1];
    this.friendsListCollection.add(new FriendModel({
      name: name,
      semester: semester,
      queryString: timetableQueryString,
      selected: false
    }));
    var friendsData = _.pluck(this.friendsListCollection.models, 'attributes');
    friendsData = _.map(friendsData, function (person) {
      return _.omit(person, 'moduleInformation');
    });
    // Don't persist current user's information into friend's data.
    friendsData = _.filter(friendsData, function (person) {
      return person.name !== USER_NAME;
    });
    localforage.setItem('timetable:friends', friendsData);
  },
  updateDisplayedTimetable: function () {

    var people = _.map(this.friendsSelectedListView.collection.models, function (person) {
      return person.get('name');
    });

    var daysNotGoingToSchool = {};
    _.each(timify.getSchoolDays(), function (day) {
      daysNotGoingToSchool[day] = people;
    });

    var combinedLessons = _.map(this.friendsSelectedListView.collection.models, function (person) {
      return _.map(person.get('moduleInformation').timetable.models, function (lesson) {
        var personName = person.get('name');
        lesson.attributes.name = personName;
        var dayText = lesson.attributes.DayText;
        daysNotGoingToSchool[dayText] = _.without(daysNotGoingToSchool[dayText], personName);
        return lesson.attributes;
      });
    });

    var daysNotGoingToSchoolList = _.map(timify.getSchoolDays(), function (day) {
      return {
        day: day,
        peopleNotGoingList: daysNotGoingToSchool[day],
        peopleNotGoing: daysNotGoingToSchool[day].join(', ')
      };
    });

    var haveSchoolEveryday = true;
    _.each(timify.getWeekDays(), function (day) {
      if (daysNotGoingToSchool[day].length > 0) {
        haveSchoolEveryday = false;
      }
    });

    if (daysNotGoingToSchool.Saturday !== people.length) {
      // By default, hide Saturday if everyone not going on Saturday
      daysNotGoingToSchoolList.splice(5, 1);
    }

    var notGoingSchoolModel = new Backbone.Model({
      daysNotGoingToSchool: daysNotGoingToSchoolList,
      haveSchoolEveryday: haveSchoolEveryday
    });

    
    this.friendsNotGoingSchoolRegion.show(new FriendsNotGoingSchoolView({
      model: notGoingSchoolModel,
    }));

    combinedLessons = _.reduce(combinedLessons, function (a, b) {
      return a.concat(b);
    }, []);

    var isMergeMode = this.friendsSelectedListView.collection.models.length > 1;

    var timetableFlexModel = new Backbone.Model({
      lessonsList: combinedLessons,
      mergeMode: isMergeMode
    });

    this.timetableRegion.show(new TimetableFlexView({
      model: timetableFlexModel
    }));
  }
});
