define([
  'backbone',
  'models/FacetModel',
  'views/FacetView'
],

  function(Backbone, FacetModel, FacetView) {
    'use strict';

    var FacetsView = Backbone.View.extend({
      initialize: function() {
        this.collection.each(function(Facet) {
          (new FacetView({
            el: $('.facet-' + Facet.get('key')),
            model: Facet
          })).render();
        });
      }
    });

    return FacetsView;
  });
