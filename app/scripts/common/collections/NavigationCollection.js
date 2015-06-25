'use strict';

var Backbone = require('backbone');
var NavigationModel = require('../models/NavigationModel');
require('backbone.select');

module.exports = Backbone.Collection.extend({
  model: NavigationModel,

  initialize: function (models) {
    Backbone.Select.One.applyTo(this, models);
  }
});
