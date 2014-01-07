define(['underscore', 'backbone', 'models/FilterModel', 'backbone.picky'],
  function(_, Backbone, Filter) {
  'use strict';

  var FilterCollection = Backbone.Collection.extend({
    model: Filter,

    initialize: function () {
      _.extend(this, new Backbone.Picky.MultiSelect(this));
    }
  });

  return FilterCollection;
});
