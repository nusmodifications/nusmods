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
      var facet = this.model.get('facet');
      ga('send', 'event', 'Modules filter',
        (this.model.selected ? 'Selected ' : 'Deselected ') + facet.get('label'),
        this.model.get('label'), facet.get('filters').selectedLength);
    },
    'click a': function (event) {
      event.preventDefault();
      this.model.collection.selectNone();
      this.model.toggleSelected();
      ga('send', 'event', 'Modules filter',
        'Selected one ' + this.model.get('facet').get('label'),
        this.model.get('label'));
    }
  },

  modelEvents: {
    'selected deselected': 'render'
  }
});
