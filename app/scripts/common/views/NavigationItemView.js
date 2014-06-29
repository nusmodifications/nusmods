define(['backbone.marionette', 'hbs!../templates/navigation_item'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'li',
      template: template,

      modelEvents: {
        'selected deselected': 'render'
      },

      onRender: function () {
        this.$el.toggleClass('active', this.model.selected);
      }
    });
  });
