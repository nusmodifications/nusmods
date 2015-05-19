'use strict';

var Backbone = require('backbone');
var Filter = require('../models/FilterModel');
require('backbone.select');

module.exports = Backbone.Collection.extend({
  model: Filter,

  initialize: function (models) {
    Backbone.Select.Many.applyTo(this, models);
  }
});
