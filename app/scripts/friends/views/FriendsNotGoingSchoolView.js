'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var template = require('../templates/friends_not_going_school.hbs');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
  },
  template: template,
  onShow: function () {

  }
});
