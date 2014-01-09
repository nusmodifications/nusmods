define(['backbone.marionette', 'hbs!../templates/module'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'tr',
      template: template
    });
  });
