var App = require('../../app');
var Marionette = require('backbone.marionette');
var Mousetrap = require('Mousetrap');
var NUSMods = require('../../nusmods');
var _ = require('underscore');
var template = require('../templates/select.hbs');
require('select2');

'use strict';

var codes, titles, modsLength;
var codesAndTitlesPromise = NUSMods.getCodesAndTitles().then(function (data) {
  codes = _.keys(data);
  titles = _.values(data);
  modsLength = codes.length;
});

module.exports = Marionette.ItemView.extend({
  template: template,

  events: {
    'select2-selecting': 'onSelect2Selecting'
  },

  ui: {
    'input': 'input'
  },

  onSelect2Selecting: function(event) {
    event.preventDefault();
    App.request('addModule', event.val);
    this.ui.input.select2('focus');
  },

  onShow: function () {
    var PAGE_SIZE = 50;
    this.ui.input.select2({
      multiple: true,
      query: function (options) {
        codesAndTitlesPromise.then(function () {
          var i,
            results = [],
            pushResult = function (i) {
              if (!App.request('isModuleSelected', codes[i])) {
                results.push({
                  id: codes[i],
                  text: codes[i] + ' ' + titles[i]
                });
              }
              return results.length;
            };
          if (options.term) {
            var re = new RegExp(options.term, 'i');
            for (i = options.context || 0; i < modsLength; i++) {
              if (codes[i].search(re) !== -1 || titles[i].search(re) !== -1) {
                if (pushResult(i) === PAGE_SIZE) {
                  i++;
                  break;
                }
              }
            }
          } else {
            for (i = (options.page - 1) * PAGE_SIZE; i < options.page * PAGE_SIZE; i++) {
              pushResult(i);
            }
          }
          options.callback({
            context: i,
            more: i < modsLength,
            results: results
          });
        });
      }
    });

    Mousetrap.bind('.', function(ev) {
      $('.timetable-input .select2-input').focus();
      ev.preventDefault();
      return false;
    });
  }
});
