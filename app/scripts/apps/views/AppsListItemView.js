'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/apps_list_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'div',
  className: 'col-md-8',
  template: template
});
