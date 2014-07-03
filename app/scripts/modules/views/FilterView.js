define(['backbone.marionette', 'hbs!../templates/filter'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'label',
      className: 'checkbox-inline',
      template: template,

      events: {
        'click :checkbox': function () {
          this.model.toggleSelected();
        },
        'click a': function (event) {
          event.preventDefault();
          this.model.collection.selectNone();
          this.model.toggleSelected();
        }
      },

      modelEvents: {
        'selected deselected': 'render'
      }
    });
  });
