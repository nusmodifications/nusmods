define(['underscore', 'backbone', 'common/models/ModuleModel'],
  function(_, Backbone, ModuleModel) {
    'use strict';

    return Backbone.Model.extend({
      initialize: function(data) {
        var section = this.get('section');
        var sectionsInfo = [
          {
            'sectionType': 'timetable',
            'tabTitle': 'Timetable',
            'sectionTitle': 'Timetable Information',
            'active': false
          },
          {
            'sectionType': 'corspedia',
            'tabTitle': 'Corspedia',
            'sectionTitle': 'CORS Bidding History',
            'active': false
          },
          {
            'sectionType': 'reviews',
            'tabTitle': 'Reviews',
            'sectionTitle': 'Reviews',
            'active': false
          }
        ];
        var selectedSection = _.filter(sectionsInfo, function (item) {
          return item.sectionType == section;
        })[0];

        selectedSection.active = true;
        this.set('sectionTitle', selectedSection.sectionTitle);
        this.set('sectionsInfo', sectionsInfo);
      }
    });
  });
