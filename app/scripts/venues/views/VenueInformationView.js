'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var template = require('../templates/venue_information.hbs');
var Backbone = require('backbone');
var VenueSelectView = require('./VenueSelectView');
var TimetableFlexView = require('../../timetable_flex/views/TimetableFlexView');

module.exports = Marionette.LayoutView.extend({
  template: template,
  initialize: function () {

  },
  regions: {
    venueSearchRegion: '.nm-venue-search',
    venueTimetableRegion: '.nm-venue-information-timetable'
  },
  onShow: function () {
    if (this.model.get('selectedVenueName')) {
      this.showAvailabilityForVenue(this.model.get('selectedVenueName'));
    }
    var _this = this;
    this.venueSearchRegion.show(new VenueSelectView({model: _this.model}));
  },
  showAvailabilityForVenue: function (venueName) {
    if (venueName !== '') {
      Backbone.history.navigate('venues/' + venueName);
    }

    var selectedVenue = null;
    if (this.model.get('venuesList').indexOf(venueName) > -1) {
      selectedVenue = this.model.get('venues')[venueName];
    }

    this.model.set('selectedVenueName', venueName);
    this.model.set('selectedVenue', selectedVenue);
    this.render();

    var lessons = _.reduce(_.pluck(selectedVenue, 'lessons'), function (memo, list) {
      return memo.concat(list);
    }, []);

    var TimetableFlexModel = new Backbone.Model({
      lessonsList: lessons,
      mergeMode: false
    });

    this.venueTimetableRegion.show(new TimetableFlexView({
      model: TimetableFlexModel
    }));
  }
});
