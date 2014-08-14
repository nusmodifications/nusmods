'use strict';

var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var analytics = require('../../analytics');
var template = require('../templates/bookmark_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'li',
  template: template,
  events: {
    'click .js-remove-bookmark': function () {
      analytics.track('Bookmarks', 'Remove bookmark', this.model.get('module'));
      App.request('deleteBookmark', this.model.get('module'));
      this.model.collection.remove(this.model);
    },
    'click a': function () {
      analytics.track('Bookmarks', 'Access module from bookmarks', this.model.get('module'));
      $('.nm-bookmark-button').qtip('hide');
    }
  }
});
