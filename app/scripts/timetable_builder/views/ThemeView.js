define(['underscore', 'backbone'], function(_, Backbone) {
    'use strict';

    function updateTheme() {
      $('body').removeClass();
      // TODO: Only remove classes that start with 'theme-'
      var theme = this.$el.val();
      $('body').addClass('theme-' + theme);
      localStorage['theme'] = theme;
      var cssFile = theme !== 'default' ? 'http://bootswatch.com/' + theme + '/bootstrap.min.css' : '';
      $('#theme').attr('href', cssFile);
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