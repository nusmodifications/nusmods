define(['underscore', 'backbone', 'common/models/ModuleModel'],
  function(_, Backbone, ModuleModel) {
    'use strict';

    return Backbone.Model.extend({
      initialize: function(data) {
        var section = this.get('section');
        var sectionsInfo = this.get('sectionsInfo');

        var selectedSection = _.filter(sectionsInfo, function (item) {
          return item.sectionType == section;
        })[0];

        selectedSection.active = true;
        this.set('sectionTitle', selectedSection.sectionTitle);
      }
    });
  });
