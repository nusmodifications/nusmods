define([
  'underscore',
  'backbone',
  '../models/NavigationModel',
  'backbone.picky'
], function (_, Backbone, NavigationModel) {
  'use strict';

  return Backbone.Collection.extend({
    model: NavigationModel,

    initialize: function () {
      _.extend(this, new Backbone.Picky.SingleSelect(this));
    }
  });
});
