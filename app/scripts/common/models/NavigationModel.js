define(['underscore', 'backbone', 'backbone.picky'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
    initialize: function() {
      _.extend(this, new Backbone.Picky.Selectable(this));
      this.selected = false;
    }
  });
});
