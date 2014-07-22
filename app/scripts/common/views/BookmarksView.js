'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var NUSMods = require('../../nusmods');
var _ = require('underscore');
var template = require('../templates/bookmarks.hbs');

module.exports = Marionette.LayoutView.extend({
  template: template,
});
