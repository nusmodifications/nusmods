'use strict';

var App = require('../../app');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'Modules',
  icon: 'search',
  url: '/modules'
});

module.exports = Marionette.Controller.extend({
  showModules: function (id) {
    var ModulesView = require('../views/ModulesView');
    var ModuleView = require('../views/ModuleView');
    var NUSMods = require('../../nusmods');
    var ModuleModel = require('../../common/models/ModuleModel');
    var ModulePageModel = require('../models/ModulePageModel');
    var facultyList = require('../../common/faculty/facultyList.json');
    navigationItem.select();
    if (!id) {
      NUSMods.getMods().then(function (mods) {
        App.mainRegion.show(new ModulesView({mods: mods}));
      });
    } else {
      var modCode = id.toUpperCase();
      NUSMods.getMod(modCode).then(function (data) {
        var moduleModel = new ModuleModel(data);
        var modulePageModel = new ModulePageModel({
          faculties: facultyList,
          module: moduleModel.attributes
        });
        App.mainRegion.show(new ModuleView({model: modulePageModel}));
      });
    }
  }
});
