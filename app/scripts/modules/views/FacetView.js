'use strict';

var Marionette = require('backbone.marionette');
var FilterView = require('./FilterView');

module.exports = Marionette.CollectionView.extend({
  childView: FilterView
});
