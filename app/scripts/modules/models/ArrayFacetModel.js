define(['underscore', 'backbone', '../collections/FilterCollection'],
  function(_, Backbone, FilterCollection) {
  'use strict';

  return Backbone.Model.extend({
    initialize: function() {
      var groupedCollection = {};
      _.each(this.get('filteredCollection'), _.bind(function(mod) {
        _.each(mod[this.get('key')], function (value) {
          groupedCollection[value] = groupedCollection[value] || [];
          groupedCollection[value].push(mod);
        });
      }, this));
      this.set('groupedCollection', groupedCollection);
      var filters = _.map(this.get('groupedCollection'), function (mods, key) {
        return {
          count: mods.length,
          label: key
        };
      });
      this.set('filters', new FilterCollection(filters));
    }
  });
});
