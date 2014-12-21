'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var template = require('../templates/barenusessities_feed_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'li',
  template: template,
  events: {
  }
});
