'use strict';

var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/exam.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'tr',
  template: template,

  events: {
    'click .remove': function (event) {
      event.preventDefault();
      App.request('removeModule', this.model.get('Semester'), this.model.id);
    },
    'click .show-hide': function (event) {
      event.preventDefault();
      var display = !this.model.get('display');
      this.model.set('display', display);
      App.request('displayLessons', this.model.get('Semester'), this.model.id, display);
    }
  },

  modelEvents: {
    change: 'render'
  },

  onRender: function () {
    this.$el.addClass('color' + this.model.get('color'))
      .toggleClass('clash', this.model.get('clash'));
  }
});
