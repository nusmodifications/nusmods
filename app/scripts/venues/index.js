'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var NUSMods = require('../nusmods');
var _ = require('underscore');

var navigationItem = App.request('addNavigationItem', {
  name: 'Venues',
  icon: 'location-arrow',
  url: '/venues'
});

var controller = {
  showVenues: function () {
    var VenuesView = require('./views/VenuesView');
    navigationItem.select();

    var venuesList = [];
    var venues = {};

    NUSMods.getAllTimetable(1).then(function (data) {
      _.each(data, function (module) {
        if (module.Timetable) {
          _.each(module.Timetable, function (cls) {
            var currentVenue = cls.Venue;
            if (!venues[currentVenue]) {
              venuesList.push(currentVenue);
              venues[currentVenue] = [];
            }
            cls.ModuleCode = module.ModuleCode;
            delete cls.Venue;
            venues[currentVenue].push(cls);
          });
        }
      });
      venuesList.sort();
      var venuesModel = new Backbone.Model({
        venues: venues,
        venuesList: venuesList
      });
      App.mainRegion.show(new VenuesView({model: venuesModel}));
    });
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'venues': 'showVenues'
    }
  });
});

