'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/shared_timetable_controls.hbs');

module.exports = Marionette.ItemView.extend({
  template: template,

  events: {
    'click .replace': 'onClickReplace'
  },

  onClickReplace: function () {
    this.collection.shared = false;
    this.collection.timetable.trigger('change');
    this.destroy();
  }
});
