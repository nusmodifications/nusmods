define(['underscore', 'backbone', '../models/FilterModel', 'backbone.picky'],
  function(_, Backbone, Filter) {
  'use strict';

  return Backbone.Collection.extend({
    model: Filter,

    initialize: function () {
      _.extend(this, new Backbone.Picky.MultiSelect(this));
    }
  });
});
