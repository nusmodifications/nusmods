'use strict';

var Marionette = require('backbone.marionette');
var analytics = require('../../analytics');
var template = require('../templates/filter.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'li',
  template: template,

  events: {
    'click :checkbox': function (event) {
      event.preventDefault();
      this.model.toggleSelected();
      var facet = this.model.get('facet');
      analytics.track('Modules filter',
        (this.model.selected ? 'S' : 'Des') + 'elected ' + facet.get('label'),
        this.model.get('label'), facet.get('filters').selectedLength);
    },
    'click a': function (event) {
      event.preventDefault();
      var facet = this.model.get('facet');
      var filters = facet.get('filters');

      // If filter is the the only one selected, do not select none before
      // toggling select, so that it will be deselected.
      if (filters.selectedLength > 1 || !filters.selected[this.model.cid]) {
        this.model.collection.selectNone();
      }
      this.model.toggleSelected();

      analytics.track('Modules filter',
        (this.model.selected ? 'S' : 'Des') + 'elected one ' + facet.get('label'),
        this.model.get('label'), filters.selectedLength);
    }
  },

  modelEvents: {
    'selected deselected': 'render'
  }
});
