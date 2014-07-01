define(['underscore', 'require', 'app', 'backbone.marionette', 'nusmods'],
  function (_, require, App, Marionette, NUSMods) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Modules',
      icon: 'search',
      url: '/modules'
    });

    return Marionette.Controller.extend({
      showModules: function () {
        require(['../views/ModulesView'],
          function (ModulesView) {
            navigationItem.select();
            App.mainRegion.show(new ModulesView());
          });
      },
      showModule: function (id, section) {
        require(['../views/ModuleView', 'nusmods', 'common/models/ModuleModel', '../models/ModulePageModel'],
          function (ModuleView, NUSMods, ModuleModel, ModulePageModel) {
            navigationItem.select();
            var modCode = id.toUpperCase();
            if (!section) {
              section = 'timetable';
            }
            NUSMods.getMod(modCode).then(function (data) {
              var moduleModel = new ModuleModel(data);
              var modulePageModel = new ModulePageModel({module: moduleModel.attributes, section: section});
              App.mainRegion.show(new ModuleView({model: modulePageModel}));
            });
          });
      }
    });
  });
