'use strict';

var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/module_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'tr',
  template: template,

  events: {
    'click .add-timetable': function(event) {
      var qtipContent;
      var currentTarget = $(event.currentTarget);
      var semester = currentTarget.data('semester');
      if (App.request('isModuleSelected', semester, this.model.id)) {
        qtipContent = 'Already added!';
      } else {
        qtipContent = 'Added!';
        App.request('addModule', semester, this.model.id);
      }
      currentTarget.qtip({
        content: qtipContent,
        show: {
          event: false,
          ready: true
        },
        hide: {
          event: false,
          inactive: 1000
        }
      });
      return false;
    },
    'click .add-bookmark': function(event) {
      App.request('addBookmark', this.model.id);
      $(event.currentTarget).qtip({
        content: 'Bookmarked!',
        show: {
          event: false,
          ready: true
        }
      });
    }
  }
});
