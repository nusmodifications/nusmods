'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var config = require('../../common/config');
var template = require('../templates/semester_selector.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'ul',
  className: 'pagination pagination-sm',
  template: template,

  initialize: function (options) {
    this.collection = new Backbone.Collection(_.map(_.range(4), function(i) {
      var sem = i + 1;
      return {
        id: sem,
        label: config.semesterNames[i],
        shortLabel: config.shortSemesterNames[i],
        url: config.semTimetableFragment(sem)
      };
    }));
    this.collection.get(options.semester).set('active', true);
  }
});
