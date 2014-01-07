define(['backbone.marionette', 'spectrum'], function (Marionette) {
  'use strict';

  return Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#exam-template',

    modelEvents: {
      change: 'render'
    },

    onRender: function () {
      this.$el.addClass('color' + this.model.get('color'))
        .toggleClass('clash', this.model.get('clash'))
        .find('.color').spectrum();
    }
  });
});
