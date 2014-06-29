define(['backbone.marionette', 'app', 'hbs!../templates/exam'],
  function (Marionette, App, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'tr',
      template: template,

      events: {
        'click .remove': function () {
          App.execute('removeModule', this.model.id);
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
  });
