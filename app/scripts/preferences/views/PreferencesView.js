define([
  'underscore',
  'backbone.marionette',
  'hbs!../templates/preferences',
  'localforage',
  'mousetrap',
  '../../common/utils/themePicker'
],

function(_, Marionette, template, localforage, Mousetrap, themePicker) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template,
    initialize: function () {
      // TODO: Populate default values of form elements for first time users.
      var formElements = {
        'faculty': '#faculty',
        'student': 'input:radio[name="student-radios"]',
        'mode': 'input:radio[name="mode-radios"]',
        'theme': '#theme-options'
      };
      _.each(formElements, function (selector, item) {
        localforage.getItem(item, function (value) {
          if (value) {
            $(selector).val([value]);
          }
        });
      });
    },
    events: {
      'click .random-theme': 'randomTheme',
      'change #faculty, input:radio[name="student-radios"], input:radio[name="mode-radios"], #theme-options': 'updatePreference',
      'keydown': 'toggleTheme'
    },
    randomTheme: function () {
      themePicker.selectRandomTheme();
    },
    updatePreference: function ($ev) {
      var $target = $($ev.target);
      $target.blur();
      var property = $target.attr('data-pref-type');
      var value = $target.val();
      this.savePreference(property, value);
    },
    savePreference: function (property, value) {
      if (property === 'faculty' && value === 'default') {
        alert('You have to select a faculty.');
        localforage.getItem(property, function (value) {
          $('#faculty').val(value);
        });
        return;
      }
      localforage.setItem(property, value);
      if (property === 'mode' || property === 'theme') {
        themePicker.updateAppearance(property, value);
      }
    }
  });
});
