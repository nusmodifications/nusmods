'use strict';

var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
  initialize: function() {
    var section = this.get('section');
    var sectionsInfo = this.get('sectionsInfo');

    var selectedSection = _.filter(sectionsInfo, function (item) {
      return item.sectionType === section;
    })[0];

    selectedSection.active = true;
    this.set('sectionTitle', selectedSection.sectionTitle);
  }
});
