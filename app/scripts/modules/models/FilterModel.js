'use strict';

var Backbone = require('backbone');
require('backbone.select');

module.exports = Backbone.Model.extend({
  initialize: function() {
    Backbone.Select.Me.applyTo(this);
    this.listenTo(this, 'selected deselected', function () {
      this.set('selected', this.selected);
    });
  }
});
