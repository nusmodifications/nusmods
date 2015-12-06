'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var template = require('../templates/contact.hbs');

module.exports = Marionette.LayoutView.extend({
  template: template
});
