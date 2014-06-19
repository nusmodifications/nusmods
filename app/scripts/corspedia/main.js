define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Corspedia',
      icon: 'list-alt',
      url: '#corspedia'
    });

    var controller = {
      showCorspedia: function () {
        require(['./views/CorspediaView'],
          function (CorspediaView) {
            navigationItem.select();
            App.mainRegion.show(new CorspediaView());
          });
      }
    };

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: controller,
        appRoutes: {
          'corspedia': 'showCorspedia'
        }
      });
    });
  });
