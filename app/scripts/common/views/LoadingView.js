define(['backbone.marionette', 'hbs!../templates/loading'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
      template: template
    });
  });
