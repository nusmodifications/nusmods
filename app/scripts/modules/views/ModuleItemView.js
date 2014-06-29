define(['backbone.marionette', 'hbs!../templates/module_item'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'tr',
      template: template
    });
  });
