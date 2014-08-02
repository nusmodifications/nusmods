'use strict';

var Marionette = require('backbone.marionette');
var FilterView = require('./FilterView');
var template = require('../templates/facet.hbs');

module.exports = Marionette.CompositeView.extend({
  childView: FilterView,
  childViewContainer: 'ul',
  className: 'nm-module-facet',
  template: template,
  ui: {
    caret: '.nm-caret'
  },
  events: {
    'click .nm-section-heading': function () {
      this.ui.caret.toggleClass('nm-caret-down');
    }
  }
});
