define(['backbone.marionette', './FacetView'],
  function (Marionette, FacetView) {
    'use strict';

    return Marionette.CollectionView.extend({
      childView: FacetView,
      childViewOptions: function (facet) {
        return {
          el: $('.facet-' + facet.get('key')),
          collection: facet.get('filters')
        };
      },

      attachBuffer: function () {
      },

      attachHtml: function () {
      }
    });
  });
