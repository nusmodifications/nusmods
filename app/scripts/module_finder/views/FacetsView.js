define(['backbone.marionette', './FacetView'],
  function (Marionette, FacetView) {
    'use strict';

    return Marionette.CollectionView.extend({
      itemView: FacetView,
      itemViewOptions: function (facet) {
        return {
          el: $('.facet-' + facet.get('key')),
          collection: facet.get('filters')
        };
      },

      appendHtml: function () {
      }
    });
  });
