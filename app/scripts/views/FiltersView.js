define([
  'backbone',
  'models/FilterModel',
  'views/FilterView'
],

  function(Backbone, FilterModel, FilterView) {
    'use strict';

    var FiltersView = Backbone.View.extend({
      initialize: function() {
        this.collection.each(function(filter) {
          (new FilterView({
            el: $('.filter-' + filter.get('key')),
            model: filter
          })).render();
        });
      }
    });

    return FiltersView;
  });