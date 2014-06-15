define(['underscore', 'backbone'], function(_, Backbone) {
    'use strict';

    function updateTheme() {
      $('body').removeClass();
      // TODO: Only remove classes that start with 'theme-'
      var themeName = this.$el.val();
      $('body').addClass('theme-' + themeName);
      localStorage['theme'] = themeName;
    }

    return Backbone.View.extend({
      el: '#theme-options',
      events: {
        'change': updateTheme
      },
      initialize: function() {
        var themeName = localStorage['theme'];
        if (themeName) {
          this.$el.val(themeName);
        }
      }
    });
  });