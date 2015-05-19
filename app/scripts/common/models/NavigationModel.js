'use strict';

var Backbone = require('backbone');
require('backbone.select');

module.exports = Backbone.Model.extend({
  initialize: function() {
    Backbone.Select.Me.applyTo(this);
    this.selected = false;
  }
});
