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
      if (App.request('isModuleSelected', this.model.id)) {
        qtipContent = 'Already added!';
      } else {
        qtipContent = 'Added!';
        App.request('addModule', this.model.id);
      }
      $(event.currentTarget).qtip({
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
