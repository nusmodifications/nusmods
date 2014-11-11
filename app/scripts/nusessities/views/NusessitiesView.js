'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/nusessities.hbs');
var $ = require('jquery');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    
  },
  template: template,
  onShow: function () {
    $('.nm-bare-nusessities-iframe').css('width', '100%');
  }
});
