define(['require', 'app', 'backbone.marionette', 'backbone'],
  function (require, App, Marionette, Backbone) {
    'use strict';

    var controller = {
      showHelp: function () {
        require(['./views/HelpView'],
          function (HelpView) {
            $.getJSON('/scripts/help/keyboardShortcuts.json', function (data) {
              var helpModel = new Backbone.Model({keyboardShortcuts: data});
              console.log(data)
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
