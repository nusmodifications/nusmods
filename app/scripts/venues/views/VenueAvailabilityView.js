'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var template = require('../templates/venue_availability.hbs');
var Backbone = require('backbone');
var timify = require('../../common/utils/timify');

module.exports = Marionette.LayoutView.extend({
  template: template,
  initialize: function () {
    
  },
  events: {
    'click .js-nm-available-venue-search': 'showAvailableVenues'
  },
  onRender: function () {
    $('.js-nm-venue-time-day-input').val(this.model.get('venueDay'));
    $('.js-nm-venue-time-start-input').val(this.model.get('venueStartTime'));
    $('.js-nm-venue-time-end-input').val(this.model.get('venueEndTime'));
  },
  showAvailableVenues: function () {
    var day = $('.js-nm-venue-time-day-input').val();
    var startTime = $('.js-nm-venue-time-start-input').val();
    var endTime = $('.js-nm-venue-time-end-input').val();

    this.model.set('venueDay', day);
    this.model.set('venueStartTime', startTime);
    this.model.set('venueEndTime', endTime);

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
    this.model.set('availableVenues', availableVenues);
    this.render();
  },
});
