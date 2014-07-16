'use strict';

var Backbone = require('backbone');
var NavigationModel = require('../models/NavigationModel');
var _ = require('underscore');
require('backbone.picky');

module.exports = Backbone.Collection.extend({
  model: NavigationModel,

  initialize: function () {
    _.extend(this, new Backbone.Picky.SingleSelect(this));
  }
});
