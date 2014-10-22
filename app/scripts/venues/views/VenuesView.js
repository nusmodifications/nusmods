'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/venues.hbs');

module.exports = Marionette.LayoutView.extend({
  template: template
});
