define(['underscore', 'backbone', '../collections/FilterCollection'],
  function (_, Backbone, FilterCollection) {
    'use strict';

    return Backbone.Model.extend({
      initialize: function () {
        this.set(
          'groupedCollection',
          _.groupBy(this.get('filteredCollection'), this.get('key'))
        );
        var filters = _.sortBy(_.map(this.get('groupedCollection'),
          function (mods, key) {
            return {
              count: mods.length,
              label: key
            };
          }), this.get('sortBy') || 'label');
        this.set('filters', new FilterCollection(filters));
      }
    });
  });
