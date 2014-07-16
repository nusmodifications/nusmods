'use strict';

var Backbone = require('backbone');
var Facet = require('../models/FacetModel');
var _ = require('underscore');

module.exports = Backbone.Collection.extend({
  model: Facet,

  initialize: function (models, options) {
    this.filteredCollection = options.filteredCollection;
    this.pageSize = options.pageSize;
    this.rawCollection = options.rawCollection;
    this.currentPage = 0;
    this.on('add', this.onAdd, this);
  },

  onAdd: function (facet) {
    facet.get('filters').on('select:all select:none select:some', this.onSelect, this);
  },

  onSelect: function () {
    var noFiltersSelected = this.all(function (facet) {
      return _.isEmpty(facet.get('filters').selected);
    });
    this.rawFilteredCollection = noFiltersSelected ?
      this.rawCollection : _.sortBy(_.intersection.apply(this,
      _.filter(this.map(function (facet) {
        return _.union.apply(this,
          _.map(facet.get('filters').selected, function (filter) {
            return facet.get('groupedCollection')[filter.get('label')];
          }));
      }), _.size)), 'ModuleCode');
    var slice = this.rawFilteredCollection.slice(0, this.pageSize);
    this.filteredCollection.reset(slice);
    this.currentPage = 1;
  },

  addNextPage: function () {
    var start = this.currentPage * this.pageSize;
    var end = start + this.pageSize;
    var slice = this.rawFilteredCollection.slice(start, end);
    if (!slice.length) {
      return false;
    }
    this.filteredCollection.add(slice);
    return this.currentPage++;
  }
});
