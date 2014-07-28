'use strict';

var App = require('../../app');
var Marionette = require('backbone.marionette');
var _ = require('underscore');

var navigationItem = App.request('addNavigationItem', {
  name: 'Modules',
  icon: 'search',
  url: '/modules'
});

var sectionsInfo = [
  {
    'sectionType': 'schedule',
    'tabTitle': 'Schedule',
    'sectionTitle': 'Class Schedule',
    'icon': 'clock-o',
    'active': false
  },
  {
    'sectionType': 'corspedia',
    'tabTitle': 'Corspedia',
    'sectionTitle': 'CORS Bidding History',
    'icon': 'bar-chart-o',
    'active': false
  },
  {
    'sectionType': 'modmaven',
    'tabTitle': 'ModMaven',
    'sectionTitle': 'Prerequisites Tree',
    'icon': 'code-fork',
    'active': false
  },
  {
    'sectionType': 'reviews',
    'tabTitle': 'Module Reviews',
    'sectionTitle': 'Reviews & Discussions',
    'icon': 'thumbs-o-up',
    'active': false
  }
];

module.exports = Marionette.Controller.extend({
  showModules: function (id, section) {
    var ModulesView = require('../views/ModulesView');
    var ModuleView = require('../views/ModuleView');
    var NUSMods = require('../../nusmods');
    var ModuleModel = require('../../common/models/ModuleModel');
    var ModulePageModel = require('../models/ModulePageModel');
    var facultyList = require('../../common/faculty/facultyList.json');
    navigationItem.select();
    if (!id) {
      App.mainRegion.show(new ModulesView());
    } else {
      var modCode = id.toUpperCase();
      var sectionTypes = _.pluck(sectionsInfo, 'sectionType');
      if (!section || sectionTypes.indexOf(section) === -1) {
        section = 'schedule';
      }
      NUSMods.getMod(modCode).then(function (data) {
        var moduleModel = new ModuleModel(data);
        var modulePageModel = new ModulePageModel({
          faculties: facultyList,
          module: moduleModel.attributes,
          section: section,
          sectionsInfo: sectionsInfo
        });
        App.mainRegion.show(new ModuleView({model: modulePageModel}));
      });
    }
  }
});
