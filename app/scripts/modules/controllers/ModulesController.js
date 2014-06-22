define(['underscore', 'require', 'app', 'backbone.marionette'],
  function (_, require, App, Marionette) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Modules',
      icon: 'search',
      url: '#modules'
    });

    return Marionette.Controller.extend({
      showModules: function () {
        require(['../views/ModulesView'],
          function (ModulesView) {
            navigationItem.select();
            App.mainRegion.show(new ModulesView());
          });
      },
      showModule: function (id) {
        require(['../views/ModuleView', 'nusmods', 'common/models/ModuleModel'],
          function (ModuleView, NUSMods, ModuleModel) {
            navigationItem.select();
            var modCode = id.toUpperCase();
            NUSMods.getMod(modCode, _.bind(function (mod) {
              mod.id = modCode;
              var moduleModel = new ModuleModel(mod);
              App.mainRegion.show(new ModuleView({model: moduleModel}));
            }, this));
          });
      }
    });
  });
