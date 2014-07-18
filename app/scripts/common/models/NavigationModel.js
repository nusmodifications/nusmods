'use strict';

var Backbone = require('backbone');
var _ = require('underscore');
require('backbone.picky');

module.exports = Backbone.Model.extend({
  initialize: function() {
    _.extend(this, new Backbone.Picky.Selectable(this));
    this.selected = false;
  }
});
