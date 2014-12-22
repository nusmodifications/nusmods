'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var localforage = require('localforage');
var template = require('../templates/preferences.hbs');
var themePicker = require('../../common/themes/themePicker');
var config = require('../../common/config');

var preferencesNamespace = config.namespaces.preferences + ':';
var ivleNamespace = config.namespaces.ivle + ':';

module.exports = Marionette.LayoutView.extend({
  template: template,
  ui: {
    faculty: '#faculty',
    student: 'input:radio[name="student-radios"]',
    mode: 'input:radio[name="mode-radios"]',
    theme: '#theme-options'
  },
  initialize: function () {
    // TODO: Populate default values of form elements for first time users.
    _.each(this.ui, function (selector, item) {
      localforage.getItem(preferencesNamespace + item, function (value) {
        if (value) {
          $(selector).val([value]);
        }
      });
    });

    localforage.getItem(ivleNamespace + 'ivleModuleHistory', function (value) {
      if (value) {
        $('#ivle-status-success').removeClass('hidden');
      }
    });

    this.ivleDialog = null;
  },
  events: {
    'click .random-theme': 'randomTheme',
    'change @ui.faculty, @ui.student, @ui.mode, @ui.theme': 'updatePreference',
    'keydown': 'toggleTheme',
    'click .connect-ivle': 'connectIvle'
  },
  connectIvle: function () {
    var that = this;
    if (that.ivleDialog === null || that.ivleDialog.closed) {
      var w = 255,
          h = 210,
          left = (screen.width / 2) - (w / 2),
          top = (screen.height / 3) - (h / 2);
      var options = 'dependent, toolbar=no, location=no, directories=no, ' +
                    'status=no, menubar=no, scrollbars=no, resizable=no, ' +
                    'copyhistory=no, width=' + w + ', height=' + h +
                    ', top=' + top + ', left=' + left;

      window.ivleLoginSuccessful = function (token) {
        $('#ivle-status-success').addClass('hidden');
        $('#ivle-status-loading').removeClass('hidden');
        localforage.setItem(ivleNamespace + 'ivleToken', token);
        that.fetchModuleHistory(token);
        window.ivleLoginSuccessful = undefined;
      };

      var callbackUrl = window.location.protocol + '//' + window.location.host + '/ivlelogin.html';
      var popUpUrl = 'https://ivle.nus.edu.sg/api/login/?apikey=APILoadTest&url=' + callbackUrl;
      that.ivleDialog = window.open(popUpUrl, '', options);
    }
    else {
      that.ivleDialog.focus();
    }
  },
  fetchModuleHistory: function (ivleToken) {
    var that = this;
    $.get(
      'https://ivle.nus.edu.sg/api/Lapi.svc/UserID_Get',
      {
        'APIKey': 'APILoadTest',
        'Token': ivleToken
      },
      function (studentId) {
        $.get(
          'https://ivle.nus.edu.sg/api/Lapi.svc/Modules_Taken',
          {
            'APIKey': 'APILoadTest',
            'AuthToken': ivleToken,
            'StudentID': studentId
          },
          function (data) { that.saveModuleHistory(data); },
          'jsonp'
        );
      },
      'jsonp'
    );
  },
  saveModuleHistory: function (moduleHistory) {
    localforage.setItem(ivleNamespace + 'ivleModuleHistory', moduleHistory.Results);
    $('#ivle-status-success').removeClass('hidden');
    $('#ivle-status-loading').addClass('hidden');
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
      window.alert('You have to select a faculty.');
      localforage.getItem(preferencesNamespace + property, function (value) {
        $('#faculty').val(value);
      });
      return;
    }
    localforage.setItem(preferencesNamespace + property, value);
    if (property === 'theme') {
      themePicker.applyTheme(value);
    } else if (property === 'mode') {
      themePicker.toggleMode();
    }
  }
});
