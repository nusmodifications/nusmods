define(['require', 'app', 'backbone.marionette', 'backbone', 'marked',
    'underscore', 'json!./keyboardShortcuts.json'],
  function (require, App, Marionette, Backbone, marked, _, keyboardShortcuts) {
    'use strict';

    var controller = {
      showHelp: function () {
        require(['./views/HelpView'],
          function (HelpView) {
            _.each(keyboardShortcuts, function (category) {
              _.each(category.shortcuts, function (shortcut) {
                shortcut.description = marked(shortcut.description);
              });
            });

            var helpModel = new Backbone.Model({keyboardShortcuts: keyboardShortcuts});
            App.mainRegion.show(new HelpView({model: helpModel}));
          });
      }
    };

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: controller,
        appRoutes: {
          'help': 'showHelp'
        }
      });
    });
  });
