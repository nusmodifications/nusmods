define([
  'underscore',
  'backbone.marionette',
  'hbs!../templates/preferences',
  'localforage'
],

function(_, Marionette, template, localforage) {
  'use strict';

  var $body = $('body');

  var PreferencesView = Marionette.Layout.extend({
    template: template,
    initialize: function() {
      var formElements = {
        'faculty': '#faculty',
        'student': 'input:radio[name="student-radios"]',
        'mode': 'input:radio[name="mode-radios"]',
        'theme': '#theme-options'
      }
      _.each(formElements, function (selector, item) {
        localforage.getItem(item, function (value) {
          $(selector).val([value]); 
        });  
      });

      var that = this;
      $body.keydown(function ($ev) {
        var keyCode = $ev.keyCode;
        var LEFT_ARROW_KEY = 37;
        var RIGHT_ARROW_KEY = 39;
        if (keyCode != LEFT_ARROW_KEY && keyCode != RIGHT_ARROW_KEY) { return; }

        var $themeOptions = $('#theme-options');
        if ($themeOptions.length) {
          // So that arrow events are prevented on non-preferences pages.
          var optionValues = [];
          $themeOptions.children('option').each(function() {
              optionValues.push($(this).val());
          });

          var newIndex = Math.min(Math.max(optionValues.indexOf($themeOptions.val()) + (keyCode == LEFT_ARROW_KEY ? -1 : +1), 0), optionValues.length - 1);
          var newTheme = optionValues[newIndex];
          $themeOptions.val(newTheme);
          that.savePreference('theme', newTheme);
        }
      });
    }, 
    events: {
      'change #faculty, input:radio[name="student-radios"], input:radio[name="mode-radios"], #theme-options': 'updatePreference',
      'keydown': 'toggleTheme'
    },
    updatePreference: function ($ev) {
      var $target = $($ev.target);
      $target.blur();
      var property = $target.attr('data-pref-type');
      var value = $target.val();
      this.savePreference(property, value);
    },
    savePreference: function (property, value) {
      localforage.setItem(property, value);
      if (property === 'mode' || property === 'theme') {
        this.updateAppearance(property, value);
      }      
    },
    updateAppearance: function (property, value) {
      
      var $body = $('body');
      $body.attr('data-' + property, value);      
      $body.removeClass();

      _.each(['mode', 'theme'], function (prop) {
        $body.addClass(prop + '-' + $body.attr('data-' + prop));
      });
      
      if (property === 'mode') {
        var cssFile = value !== 'default' ? 'styles/' + value + '.min.css' : '';
        $('#mode').attr('href', cssFile);
      }
    }
  });

  return PreferencesView;
});
