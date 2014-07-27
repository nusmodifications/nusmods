'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var config = require('../../common/config');
var template = require('../templates/semester_selector.hbs');

var semesterNames = [
  'Semester 1',
  'Semester 2',
  'Special Term I',
  'Special Term II'
];

module.exports = Marionette.ItemView.extend({
  tagName: 'ul',
  className: 'pagination',
  template: template,

  initialize: function (options) {
    this.collection = new Backbone.Collection(_.map(_.range(4), function(i) {
      var sem = i + 1;
      return {
        id: sem,
        label: semesterNames[i],
        url: config.semTimetableFragment(sem)
      };
    }));
    this.collection.get(options.semester).set('active', true);
  }
});
