'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var template = require('../templates/venue_information.hbs');
var Backbone = require('backbone');
var timify = require('../../common/utils/timify');

module.exports = Marionette.LayoutView.extend({
  template: template,
  initialize: function () {
    
  },
  events: {
    'keypress input[type=text]': 'processKey',
    'click .js-nm-venue-search': 'searchVenue',
    'click .js-nm-available-venue-search': 'showAvailableVenues'
  },
  processKey: function (e) {
    if (e.which === 13) { // Enter key
      this.searchVenue();
    }
    return;
  },
  onShow: function () {
    this.showAvailabilityForVenue(this.model.get('selectedVenueName'));
  },
  searchVenue: function () {
    var searchText = $.trim($('.js-nm-venue-input').val().toUpperCase());
    this.showAvailabilityForVenue(searchText);
  },
  showAvailabilityForVenue: function (venue) {
    var selectedVenue = null;
    if (this.model.get('venuesList').indexOf(venue) > -1) {
      selectedVenue = this.model.get('venues')[venue];
    }
    this.model.set('selectedVenue', selectedVenue);
    this.model.set('selectedVenueName', venue);
    if (venue !== '') {
      Backbone.history.navigate('venues/' + venue);
    }
    this.render();
  },
  showAvailableVenues: function () {
    var day = $('.js-nm-venue-time-day-input').val();
    var startTime = $('.js-nm-venue-time-start-input').val();
    var endTime = $('.js-nm-venue-time-end-input').val();

    var venuesList = this.model.get('venuesList');
    var venues = this.model.get('venues');

    var dayIndex = timify.getWeekdays().indexOf(day);
    var startIndex = timify.convertTimeToIndex(startTime);
    var endIndex = timify.convertTimeToIndex(endTime) - 1;

    if (endIndex - startIndex < 0) {
      return [];
    }

    var availableVenues = _.filter(venuesList, function (venueName) {
      var availability = venues[venueName][dayIndex].availability;
      for (var i = startIndex; i <= endIndex; i++) {
        if (availability[timify.convertIndexToTime(i)] === 'occupied') {
          return false;
        }
      }
      return true;
    });

    console.log(availableVenues);
  },
});
