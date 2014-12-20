'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/nusessities.hbs');
var $ = require('jquery');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    $.get('http://0.0.0.0/bare/barenusessities.php', function (data) {
      console.log(data);
    });
  },
  template: template,
  onShow: function () {
    $('.nm-bare-nusessities-iframe').css('width', '100%');
  }
});
