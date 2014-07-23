'use strict';

var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/bookmark_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'li',
  template: template,
  events: {
    'click .js-remove-bookmark': function(event) {
      App.request('deleteBookmark', this.model.get('module'));
      this.model.collection.remove(this.model);
    }
  }
});
