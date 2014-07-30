'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/filter.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'li',
  template: template,

  events: {
    'click :checkbox': function (event) {
      event.preventDefault();
      this.model.toggleSelected();
    },
    'click a': function (event) {
      event.preventDefault();
      this.model.collection.selectNone();
      this.model.toggleSelected();
    }
  },

  modelEvents: {
    'selected deselected': 'render'
  }
});
