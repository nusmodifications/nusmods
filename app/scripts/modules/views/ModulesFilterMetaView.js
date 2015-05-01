'use strict';

var App = require('../../app');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var template = require('../templates/modules_filter_meta.hbs');

module.exports = Marionette.CompositeView.extend({
  template: template,
  initialize: function () {
    this.parseSelectedFilters();
  },
  events: {
    'click .js-nm-module-filter-button': function (event) {
      // Get the label of the filter that the user deselected
      var deselectedFilter = event.currentTarget.getAttribute('data-filter');
      //Find and deselect the filter
      _.each(this.model.get('collection').models, function (facet) {
        _.each(facet.get('filters').selected, function (filter) {
          if (filter.get('label') === deselectedFilter) {
            filter.deselect();
          }
        });
      });
      // Tell FacetsView to update selectedFilters
      App.vent.trigger('filterUpdated');
    }
  },
  parseSelectedFilters: function () {
    var selectedFilters = this.model.get('selectedFilters');
    var selectedFiltersParsed = _.map(selectedFilters, function (value, key) {
      return {
        type: key,
        options: value
      };  
    });
    this.model.set('selectedFiltersParsed', selectedFiltersParsed);
  },
  updateView: function (selectedFilters, resultsLength) {
    this.model.set('selectedFilters', selectedFilters);
    this.model.set('resultsLength', resultsLength);
    this.parseSelectedFilters();
    this.render();
  }
});
