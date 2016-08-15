'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _Promise = require('bluebird');
var config = require('../../common/config');

var navigationItem = App.request('addNavigationItem', {
  name: 'Modules',
  icon: 'search',
  url: '/modules'
});

module.exports = Marionette.Controller.extend({
  showModules: function (id) {
    var ModulesView = require('../views/ModulesView');
    var ModuleView = require('../views/ModuleView');
    var LoadingView = require('../../common/views/LoadingView');
    var NUSMods = require('../../nusmods');
    var ModuleModel = require('../../common/models/ModuleModel');
    var ModulePageModel = require('../models/ModulePageModel');
    var facultyList = require('../../common/faculty/facultyList.json');
    navigationItem.select();
    App.mainRegion.show(new LoadingView());
    if (!id) {
      _Promise.all([
        NUSMods.getMods(),
        NUSMods.getFacultyDepartments(config.semester)
      ]).then(function (response) {
        App.mainRegion.show(
          new ModulesView({
            mods: response[0],
            facultyDepartments: response[1]
          }));
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
      }).catch(function(){
        Backbone.history.navigate('/timetable', {trigger: true, navigate: true})
      });
    }
  }
});
