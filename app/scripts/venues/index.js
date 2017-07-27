'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var NUSMods = require('../nusmods');
var _ = require('underscore');
var config = require('../common/config');
var _Promise = require('bluebird');

var navigationItem = App.request('addNavigationItem', {
  name: 'Venues',
  icon: 'building-o',
  url: '/venues'
});

var loadVenueInformation = function (callback) {
  _Promise.all([
    NUSMods.getVenueInformation(config.semester),
    NUSMods.getVenues(config.semester)
  ]).then(function (response) {
    var venues = response[0];
    var venuesList = response[1].filter(_.identity);
    // TODO: Change key from classes to lessons for venues api
    _.each(venues, function (value) {
      _.each(value, function (day) {
        if (day.Classes) {
          day.lessons = day.Classes;
          delete day.Classes;
        }
      });
    });
    callback(venues, venuesList);
  });
};

var controller = {
  showVenueInformation: function (venueName) {
    navigationItem.select();

    if (!venueName) {
      // Set to empty string for the default page
      venueName = '';
    }

    loadVenueInformation(function (venues, venuesList) {
      var VenueInformationView = require('./views/VenueInformationView');
      var venuesModel = new Backbone.Model({
        selectedVenueName: venueName,
        venues: venues,
        venuesList: venuesList,
        selectedVenue: null
      });

      App.mainRegion.show(new VenueInformationView({model: venuesModel}));
    });
  },
  showVenueAvailability: function () {
    navigationItem.select();
    loadVenueInformation(function (venues, venuesList) {
      var VenueAvailabilityView = require('./views/VenueAvailabilityView');
      var venuesModel = new Backbone.Model({
        venues: venues,
        venuesList: venuesList
      });

      App.mainRegion.show(new VenueAvailabilityView({model: venuesModel}));
    });
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'venues': 'showVenueInformation',
      'venues(/:id)': 'showVenueInformation',
      'venueavailability': 'showVenueAvailability'
    }
  });
});

