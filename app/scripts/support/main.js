define(['require', 'app', 'backbone.marionette', 'backbone'],
  function (require, App, Marionette, Backbone) {
    'use strict';

    var controller = {
      showChat: function () {
        require(['./views/ChatView'], function (ChatView) {
          App.mainRegion.show(new ChatView());
          App.navigationRegion.currentView.options.collection.deselect();
        });
      }
    };

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: controller,
        appRoutes: {
          'support': 'showChat',
        }
      });
    });
  });
