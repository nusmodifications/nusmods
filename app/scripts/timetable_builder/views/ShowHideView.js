define(['backbone.marionette', 'hbs!../templates/show_hide', 'bootstrap/button'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
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
  });
