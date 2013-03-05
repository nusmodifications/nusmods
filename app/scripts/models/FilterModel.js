define(['backbone'], function(Backbone) {
  'use strict';

  var Filter = Backbone.Model.extend({
    defaults: {
      selected: []
    },

    initialize: function() {
      this.set(
        'groupedCollection',
        _.groupBy(this.get('filteredCollection'), this.get('key'))
      );
    }
  });

  return Filter;
});