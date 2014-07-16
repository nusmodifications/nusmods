'use strict';

var Marionette = require('backbone.marionette');
var ModuleItemView = require('./ModuleItemView');
var template = require('../templates/modules_listing.hbs');

module.exports = Marionette.CompositeView.extend({
  tagName: 'table',
  className: 'table table-bordered table-striped',
  childView: ModuleItemView,
  childViewContainer: 'tbody',
  template: template
});
