'use strict';

var ExamView = require('./ExamView');
var Marionette = require('backbone.marionette');
var template = require('../templates/exams.hbs');

module.exports = Marionette.CompositeView.extend({
  tagName: 'table',
  className: 'table table-bordered table-condensed',
  childView: ExamView,
  childViewContainer: 'tbody',
  template: template,

  collectionEvents: {
    'add remove': function() {
      $('#clash').toggleClass('hidden', !this.collection.clashCount);
    }
  }
});
