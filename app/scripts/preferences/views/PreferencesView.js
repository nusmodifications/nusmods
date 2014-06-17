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
    }, 
    events: {
      'change #faculty': 'savePreference',
      'change input:radio[name="student-radios"]': 'savePreference',
      'change input:radio[name="mode-radios"]': 'savePreference',
      'change #theme-options': 'savePreference',
    },
    savePreference: function ($el) {

      var property = $($el.target).attr('data-pref-type');
      var value = $el.target.value;
      localforage.setItem(property, value);

      console.log(property, value);
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
