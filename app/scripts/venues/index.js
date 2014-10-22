'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var NUSMods = require('../nusmods');
var _ = require('underscore');
var config = require('../common/config');

var navigationItem = App.request('addNavigationItem', {
  name: 'Venues',
  icon: 'location-arrow',
  url: '/venues'
});

var controller = {
  showAvailabilityOfVenue: function (venueName) {
    if (!venueName) {
      // Set to empty string for the default page
      venueName = '';
    }

    var VenuesView = require('./views/VenuesView');
    navigationItem.select();

    // List of venues ['LT17', 'BIZ2-0118', 'COM1-0114', ...]
    var venuesList = [];
    var venues = {};

    NUSMods.getAllTimetable(config.semester).then(function (data) {
      // Make a deepcopy so modifications will not affect the cached timetable data
      var timetables = jQuery.extend(true, {}, data); 

      _.each(timetables, function (module) {
        if (module.Timetable) {
          _.each(module.Timetable, function (cls) {
            var currentVenue = cls.Venue;
            if (!venues[currentVenue]) {
              venues[currentVenue] = [];
            }
            cls.ModuleCode = module.ModuleCode;
            delete cls.Venue;
            venues[currentVenue].push(cls);
          });
        }
      });

      venues = _.omit(venues, ''); // Delete empty venue string
      
      venuesList = _.keys(venues);
      _.each(venuesList, function (venueName) {
        var venueTimetable = venues[venueName];
        var newVenueTimetable = [];
        var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        _.each(days, function (day) {
          var classes = _.filter(venueTimetable, function (cls) {
            return cls.DayText === day;
          });
          classes = _.sortBy(classes, function (cls) {
            return cls.StartTime + cls.EndTime;
          });
          newVenueTimetable.push({
            day: day,
            classes: classes
          });
        });
        venues[venueName] = newVenueTimetable;
      });

      venuesList.sort();

      var venuesModel = new Backbone.Model({
        selectedVenueName: venueName,
        venues: venues,
        venuesList: venuesList,
        selectedVenue: null
      });

      App.mainRegion.show(new VenuesView({model: venuesModel}));
    });
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'venues': 'showAvailabilityOfVenue',
      'venues(/:id)': 'showAvailabilityOfVenue'
    }
  });
});

