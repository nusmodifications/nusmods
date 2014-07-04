define(['backbone.marionette', 'app', 'hbs!../templates/exam'],
  function (Marionette, App, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'tr',
      template: template,

      events: {
        'click .remove': function () {
          App.request('removeModule', this.model.id);
        },
        'click .show-hide': function () {
          var display = !this.model.get('display');
          this.model.set('display', display);
          App.request('displayLessons', this.model.id, display);
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
