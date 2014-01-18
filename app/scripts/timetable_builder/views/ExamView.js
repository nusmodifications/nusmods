define(['backbone.marionette', 'hbs!../templates/exam'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'tr',
      template: template,

      modelEvents: {
        change: 'render'
      },

      onRender: function () {
        this.$el.addClass('color' + this.model.get('color'))
          .toggleClass('clash', this.model.get('clash'));
      }
    });
  });
