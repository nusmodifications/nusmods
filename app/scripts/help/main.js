define(['require', 'app', 'backbone.marionette', 'backbone', 'marked', 'underscore'],
  function (require, App, Marionette, Backbone, marked, _) {
    'use strict';

    var controller = {
      showHelp: function () {
        require(['./views/HelpView'],
          function (HelpView) {
            $.getJSON('/scripts/help/keyboardShortcuts.json', function (data) {
              _.each(data, function (category) {
                _.each(category.shortcuts, function (shortcut) {
                  shortcut.description = marked(shortcut.description);
                })
              })
              var helpModel = new Backbone.Model({keyboardShortcuts: data});
              App.mainRegion.show(new HelpView({model: helpModel}));
            });
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
