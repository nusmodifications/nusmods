'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BookmarkItemView = require('./BookmarkItemView');
var template = require('../templates/bookmarks.hbs');

module.exports = Marionette.CompositeView.extend({
  className: 'nm-bookmarks',
  childView: BookmarkItemView,
  childViewContainer: 'ul',
  template: template
});
