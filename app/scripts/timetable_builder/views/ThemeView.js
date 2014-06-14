define(['underscore', 'backbone'], function(_, Backbone) {
    'use strict';

    function updateTheme() {
      $('body').removeClass();
      // TODO: Only remove classes that start with 'theme-'
      $('body').addClass('theme-' + this.$el.val());
    }

    return Backbone.View.extend({
      el: '#theme-options',
      events: {
        'change': updateTheme
      }
    });
  });