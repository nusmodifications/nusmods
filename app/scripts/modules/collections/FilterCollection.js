'use strict';

var Backbone = require('backbone');
var Filter = require('../models/FilterModel');
var _ = require('underscore');
require('backbone.picky');

module.exports = Backbone.Collection.extend({
  model: Filter,

  initialize: function () {
    _.extend(this, new Backbone.Picky.MultiSelect(this));
  }
});
