'use strict';

var Backbone = require('backbone');
var FilterCollection = require('../collections/FilterCollection');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
  initialize: function () {
    this.set(
      'groupedCollection',
      _.groupBy(this.get('filteredCollection'), this.get('key'))
    );
    var facet = this;
    var filters = _.sortBy(_.map(this.get('groupedCollection'),
      function (mods, key) {
        return {
          count: mods.length,
          facet: facet,
          label: key
        };
      }), this.get('sortBy') || 'label');
    this.set('filters', new FilterCollection(filters));
  }
});
