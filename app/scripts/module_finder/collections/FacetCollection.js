define(['underscore', 'backbone', '../models/FacetModel'],
  function(_, Backbone, Facet) {
  'use strict';

  var FacetCollection = Backbone.Collection.extend({
    model: Facet,

    initialize: function (models, options) {
      this.filteredCollection = options.filteredCollection;
      this.on('add', this.onAdd, this);
    },

    onAdd: function (facet) {
      facet.get('filters').on('select:all select:none select:some', this.onSelect, this);
    },

    onSelect: function () {
      this.filteredCollection.reset(_.intersection.apply(this,
        _.filter(this.map(function (facet) {
          return _.union.apply(this,
            _.map(facet.get('filters').selected, function (filter) {
              return facet.get('groupedCollection')[filter.get('label')];
            }));
        }), _.size)));
    }
  });

  return FacetCollection;
});
