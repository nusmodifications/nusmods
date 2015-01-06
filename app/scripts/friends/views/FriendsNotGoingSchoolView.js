'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/friends_not_going_school.hbs');

module.exports = Marionette.LayoutView.extend({
  template: template
});
