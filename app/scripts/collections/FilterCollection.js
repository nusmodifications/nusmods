define(['backbone', 'models/FilterModel'], function(Backbone, Filter) {
  'use strict';

  var FilterCollection = Backbone.Collection.extend({
    model: Filter
  });

  return FilterCollection;
});