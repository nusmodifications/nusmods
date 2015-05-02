'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/navigation_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'li',
  template: template,

  modelEvents: {
    'selected deselected': 'toggleActive'
  },

  toggleActive: function () {
    this.$el.toggleClass('active', this.model.selected);
  }
});
