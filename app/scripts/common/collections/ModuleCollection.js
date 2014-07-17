'use strict';

var Backbone = require('backbone');
var Module = require('../models/ModuleModel');

module.exports = Backbone.Collection.extend({
  model: Module
});
