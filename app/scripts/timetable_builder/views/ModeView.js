define(['underscore', 'backbone', 'localforage'], function(_, Backbone, localforage) {
    'use strict';

    function updatemode() {
      $('body').removeClass();
      // TODO: Only remove classes that start with 'mode-'
      var mode = this.$el.val();
      $('body').addClass('mode-' + mode);
      localforage.setItem('mode', mode);
      var cssFile = mode !== 'default' ? 'styles/' + mode + '.min.css' : '';
      $('#mode').attr('href', cssFile);
    }

    return Backbone.View.extend({
      el: '#mode-options',
      events: {
        'change': updatemode
      },
      initialize: function() {
        var that = this;
        localforage.getItem('mode', function (mode) {
          if (mode) {
            that.$el.val(mode);
          }
        });
      }
    });
  });