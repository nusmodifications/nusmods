define(['backbone', 'models/FacetModel'], function(Backbone, Facet) {
  'use strict';

  var FacetCollection = Backbone.Collection.extend({
    model: Facet
  });

  return FacetCollection;
});
