'use strict';

var Marionette = require('backbone.marionette');
var _ = require('underscore');

module.exports = Marionette.Behavior.extend({
  defaults: {
    triggerThreshold: 100
  },

  events: {
    'click @ui.backToTopButton': 'scrollToTop'
  },

  onShow: function () {
    var that = this;
    $(window).scroll(_.debounce(function () {
      $(that.view.ui.backToTopButton).toggleClass('visible', 
        $(this).scrollTop() > that.options.triggerThreshold);
    }, 50));
  },

  scrollToTop: function () {
    $('body').stop().animate({scrollTop: 0}, 400);
    $(this.view.ui.backToTopButton).blur();
  }
});