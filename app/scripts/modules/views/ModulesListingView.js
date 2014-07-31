'use strict';

var Marionette = require('backbone.marionette');
var ModuleItemView = require('./ModuleItemView');
var template = require('../templates/modules_listing.hbs');
var _ = require('underscore');

var EmptyView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template('<td colspan="5" class="empty-module-listing">No modules meet the criteria.</td>')
});

module.exports = Marionette.CompositeView.extend({
  tagName: 'table',
  className: 'table table-bordered table-striped',
  childView: ModuleItemView,
  childViewContainer: 'tbody',
  emptyView: EmptyView,
  template: template
});
