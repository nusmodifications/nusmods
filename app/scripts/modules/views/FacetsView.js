'use strict';

var FacetView = require('./FacetView');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var localforage = require('localforage');

module.exports = Marionette.CollectionView.extend({
  childView: FacetView,
  childViewOptions: function (facet) {
    return {
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
  onShow: function () {
    localforage.getItem('moduleFinder:facets', function(data) {
      if (data) {
        _.each(data, function (id) {
          $('#' + id).addClass('in');
        })
      }
    });

    $('.collapse').on('shown.bs.collapse hidden.bs.collapse', function () {
      localforage.setItem('moduleFinder:facets', _.pluck($('.collapse.in'), 'id'));
    });
  },
  events: {
    'click .panel-heading': function (ev) {
      // console.log($(ev.target).attr('data-target'));
    }
  }, 

  initialize: function (options) {
    _.bindAll(this, 'onScroll');

    this.$window = $(window);
    this.$document = $(document);
    this.threshold = options.threshold;

    this.listenTo(this.collection.filteredCollection, 'reset', this.onReset);
    this.collection.onSelect();
  }
});
