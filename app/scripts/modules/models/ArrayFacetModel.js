'use strict';

var Backbone = require('backbone');
var FilterCollection = require('../collections/FilterCollection');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
  initialize: function () {
    var groupedCollection = {};
    _.each(this.get('filteredCollection'), _.bind(function (mod) {
      _.each(mod[this.get('key')], function (value) {
        groupedCollection[value] = groupedCollection[value] || [];
        groupedCollection[value].push(mod);
      });
    }, this));
    this.set('groupedCollection', groupedCollection);
    var filters = _.sortBy(_.map(this.get('groupedCollection'),
      function (mods, key) {
        return {
          count: mods.length,
          label: key
        };
      }), 'label');
    this.set('filters', new FilterCollection(filters));
  }
});
