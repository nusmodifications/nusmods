'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/tips.hbs');

module.exports = Marionette.ItemView.extend({
  template: template,
  initialize: function () {
    var tips = this.model.get('tips');
    this.tipsLength = tips.length;
    this.selectedIndex = Math.floor(Math.random() * (tips.length));
    this.model.set('selectedTip', tips[this.selectedIndex]);
  },
  events: {
    'click .js-next-tip': function () {
      this.selectedIndex = (this.selectedIndex + 1) % this.tipsLength;
      this.model.set('selectedTip', this.model.get('tips')[this.selectedIndex]);
    }
  },
  modelEvents: {
    change: 'render'
  }
});
