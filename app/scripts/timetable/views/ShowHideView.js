'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var template = require('../templates/show_hide.hbs');
require('bootstrap/button');

module.exports = Marionette.ItemView.extend({
  template: template,

  events: {
    'click .btn': 'onClick'
  },

  onClick: function (event) {
    var label = $(event.currentTarget).text().trim().toLowerCase();
    $('#timetable-wrapper').toggleClass('hide-' + label);
  },

  onShow: function () {
    this.$('label:last-child').qtip({
      content: 'Only shown if Odd/Even/Irregular',
      position: {
        my: 'bottom right'
      }
    });
  }
});
