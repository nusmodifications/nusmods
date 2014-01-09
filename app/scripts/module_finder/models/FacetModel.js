define(['underscore', 'backbone', '../collections/FilterCollection'],
  function(_, Backbone, FilterCollection) {
  'use strict';

  var Facet = Backbone.Model.extend({
    initialize: function() {
      this.set(
        'groupedCollection',
        _.groupBy(this.get('filteredCollection'), this.get('key'))
      );
      var filters = _.map(this.get('groupedCollection'), function (mods, key) {
        return {
          count: mods.length,
          label: key
        }
      });
      this.set('filters', new FilterCollection(filters));
    }
  });

  return Facet;
});
