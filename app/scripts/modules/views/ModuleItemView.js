define(['app', 'backbone.marionette', 'hbs!../templates/module_item'],
  function (App, Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
      tagName: 'tr',
      template: template,

      events: {
        'click .add': function(event) {
          var qtipContent;
          if (App.request('isModuleSelected', this.model.id)) {
            qtipContent = 'Already added!';
          } else {
            qtipContent = 'Added!';
            App.request('addModule', this.model.id);
          }
          $(event.currentTarget).qtip({
            content: qtipContent,
            show: {
              event: false,
              ready: true
            },
            hide: {
              event: false,
              inactive: 1000
            }
          });
        }
      }
    });
  });
