define(['underscore', 'backbone.marionette', './FacetView'],
  function (_, Marionette, FacetView) {
    'use strict';

    return Marionette.CollectionView.extend({
      childView: FacetView,
      childViewOptions: function (facet) {
        return {
          el: $('.facet-' + facet.get('key')),
          collection: facet.get('filters')
        };
      },

      onReset: function () {
        this.$window.off('scroll', this.onScroll).scroll(this.onScroll);
      },

      onScroll: function () {
        if (this.$window.scrollTop() + this.$window.height() + this.threshold >= this.$document.height()) {
          if (!this.collection.addNextPage()) {
            this.$window.off('scroll', this.onScroll);
          }
        }
      },

      initialize: function (options) {
        _.bindAll(this, 'onScroll');

        this.$window = $(window);
        this.$document = $(document);
        this.threshold = options.threshold;

        this.listenTo(this.collection.filteredCollection, 'reset', this.onReset);
        this.collection.onSelect();
      },

      attachBuffer: function () {
      },

      attachHtml: function () {
      }
    });
  });
