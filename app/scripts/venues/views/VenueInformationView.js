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
    'click .js-nm-venue-search': 'searchVenue'
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
    _.each(selectedVenue, function (day) {
      var range = _.map(_.range(timify.convertTimeToIndex('0800'), 
                                timify.convertTimeToIndex('2400')), function () {
        return {
          width: 1,
          module: ''
        }
      });

      _.each(day.classes, function (cls) {
        var eightAmIndex = timify.convertTimeToIndex('0800');
        var startIndex = timify.convertTimeToIndex(cls.StartTime) - eightAmIndex;
        var endIndex = timify.convertTimeToIndex(cls.EndTime) - eightAmIndex;
        var width = endIndex - startIndex;
        range[startIndex] = {
          width: width,
          module: cls.ModuleCode,
          class: 'nm-flex-occupied'
        };
      });

      var finalRange = [];
      var step;
      for (var i = 0; i < range.length; i += step) {
        step = range[i].width;
        finalRange.push(range[i]);
      }
      day.timetable = finalRange;
      console.log(_.reduce(_.pluck(finalRange, 'width'), function (memo, num) {
        return memo + num;
      }));
    });
    if (venue !== '') {
      Backbone.history.navigate('venue/' + venue);
    }
    this.render();
  }
});
