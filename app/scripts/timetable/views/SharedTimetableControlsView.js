define(['backbone.marionette', 'hbs!../templates/shared_timetable_controls'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
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
  });
