define(['underscore', 'backbone', 'localforage'], function(_, Backbone, localforage) {
    'use strict';

    function updateTheme() {
      var $timetable = $('#timetable-page');
      $timetable.removeClass();
      // TODO: Only remove classes that start with 'theme-'
      var theme = this.$el.val();
      $timetable.addClass('theme-' + theme);
      localforage.setItem('theme', theme);
    }

    return Backbone.View.extend({
      el: '#theme-options',
      events: {
        change: updateTheme
      },
      initialize: function() {
        var that = this;
        localforage.getItem('theme', function (theme) {
          if (theme) {
            that.$el.val(theme);
            $('#timetable-page').addClass('theme-' + theme);
          }
        });
      }
    });
  });