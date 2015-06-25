'use strict';

var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var Mousetrap = require('mousetrap');
var NUSMods = require('../../nusmods');
var analytics = require('../../analytics');
var template = require('../templates/select.hbs');
require('select2');

module.exports = Marionette.ItemView.extend({
  template: template,

  events: {
    'select2-selecting': 'onSelect2Selecting'
  },

  ui: {
    'input': 'input'
  },

  initialize: function (options) {
    this.semester = options.semester;
  },

  onSelect2Selecting: function (event) {
    event.preventDefault();
    App.request('addModule', this.semester, event.val);
    this.ui.input.select2('focus');
  },

  onShow: function () {
    var PAGE_SIZE = 50;
    var semester = this.semester;
    this.ui.input.select2({
      multiple: true,
      query: function (options) {
        NUSMods.getCodesAndTitles().then(function (data) {
          var i,
            results = [],
            pushResult = function (i) {
              var code = data[i].ModuleCode;
              if (!App.request('isModuleSelected', semester, code)) {
                results.push({
                  id: code,
                  text: code + ' ' + data[i].ModuleTitle
                });
              }
              return results.length;
            };
          var re = new RegExp(options.term, 'i');
          for (i = options.context || 0; i < data.length; i++) {
            if (data[i].Semesters.indexOf(semester) !== -1 &&
              (!options.term ||
                data[i].ModuleCode.search(re) !== -1 ||
                data[i].ModuleTitle.search(re) !== -1)) {
              if (pushResult(i) === PAGE_SIZE) {
                i++;
                break;
              }
            }
          }
          options.callback({
            context: i,
            more: i < data.length,
            results: results
          });
        });
      }
    });

    Mousetrap.bind('.', function (ev) {
      analytics.track('Search', 'Keyboard', 'Timetable Search');
      $('.timetable-input .select2-input').focus();
      ev.preventDefault();
      return false;
    });
  }
});
