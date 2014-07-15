define(['underscore', 'require', 'app', 'backbone.marionette'],
  function (_, require, App, Marionette) {
    'use strict';

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
        'active': false
      },
      {
        'sectionType': 'corspedia',
        'tabTitle': 'Corspedia',
        'sectionTitle': 'CORS Bidding History',
        'active': false
      },
      {
        'sectionType': 'modmaven',
        'tabTitle': 'ModMaven',
        'sectionTitle': 'Prerequisites Tree',
        'active': false
      },
      {
        'sectionType': 'reviews',
        'tabTitle': 'Reviews & Discussions',
        'sectionTitle': 'Reviews & Discussions',
        'active': false
      }
    ];

    return Marionette.Controller.extend({
      showModules: function (id, section) {
        require(['../views/ModulesView', '../views/ModuleView', 'nusmods',
            'common/models/ModuleModel', '../models/ModulePageModel', 
            'json!common/faculty/facultyList.json'],
          function (ModulesView, ModuleView, NUSMods, ModuleModel, ModulePageModel, facultyList) {
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
          });
      }
    });
  });
