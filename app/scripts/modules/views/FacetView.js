'use strict';

var Marionette = require('backbone.marionette');
var FilterView = require('./FilterView');
var template = require('../templates/facet.hbs');

module.exports = Marionette.CompositeView.extend({
  childView: FilterView,
  childViewContainer: 'ul',
  template: template
});
