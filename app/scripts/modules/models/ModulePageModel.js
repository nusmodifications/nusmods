define(['underscore', 'backbone', 'common/models/ModuleModel'],
  function(_, Backbone, ModuleModel) {
  'use strict';

  return Backbone.Model.extend({
    initialize: function(data) {
      var section = this.get('section');
      var sectionTitle = '';
      switch (section) {
        case 'cors':
          sectionTitle = 'Cors Bidding History';
          break;
        case 'reviews':
          sectionTitle = 'Micro-reviews';
          break;
        case 'timetable':
          sectionTitle = 'Timetable';
          break;
      }
      this.set('sectionTitle', sectionTitle);
    }
  });
});
