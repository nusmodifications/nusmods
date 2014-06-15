define(['underscore', 'backbone', 'localforage'], function(_, Backbone, localforage) {
    'use strict';

    function updateTheme() {
      $('body').removeClass();
      // TODO: Only remove classes that start with 'theme-'
      var theme = this.$el.val();
      $('body').addClass('theme-' + theme);
      localforage.setItem('theme', theme);
      var cssFile = theme !== 'default' ? 'styles/' + theme + '.min.css' : '';
      $('#theme').attr('href', cssFile);
    }

    return Backbone.View.extend({
      el: '#theme-options',
      events: {
        'change': updateTheme
      },
      initialize: function() {
        var that = this;
        localforage.getItem('theme', function (theme) {
          if (theme) {
            that.$el.val(theme);
          }
        });
      }
    });
  });