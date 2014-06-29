define(['require', 'app', 'backbone.marionette'],
  function (require, App, Marionette) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'IVLE',
      icon: 'graduation-cap',
      url: '#ivle'
    });

    var controller = {
      showIvle: function () {
        require(['./views/IvleView'],
          function (IvleView) {
            navigationItem.select();
            App.mainRegion.show(new IvleView());
          });
      }
    };

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: controller,
        appRoutes: {
          'ivle': 'showIvle'
        }
      });
    });
  });
