'use strict';

var Marionette = require('backbone.marionette');
var ModuleItemView = require('./ModuleItemView');
var _ = require('underscore');

var EmptyView = Marionette.ItemView.extend({
  className: 'empty-module-listing',
  template: _.template('No modules meet the criteria.')
});

module.exports = Marionette.CollectionView.extend({
  childView: ModuleItemView,
  emptyView: EmptyView
});
