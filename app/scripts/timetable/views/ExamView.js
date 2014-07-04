define(['backbone.marionette', 'app', 'hbs!../templates/exam'],
  function (Marionette, App, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'tr',
      template: template,

      ui: {
        showHideIcon: '.show-hide i'
      },

      events: {
        'click .remove': function () {
          App.request('removeModule', this.model.id);
        },
        'click .show-hide': function () {
          this.displayLessons = !this.displayLessons;
          App.request('displayLessons', this.model.id, this.displayLessons);
          this.ui.showHideIcon.toggleClass('fa-eye fa-eye-slash');
        }
      },

      modelEvents: {
        change: 'render'
      },

      initialize: function () {
        this.displayLessons = true;
      },

      onRender: function () {
        this.$el.addClass('color' + this.model.get('color'))
          .toggleClass('clash', this.model.get('clash'));
      }
    });
  });
