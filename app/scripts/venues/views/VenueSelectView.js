'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var selectResultTemplate = require('../templates/venue_select_result.hbs');
var template = require('../templates/venue_select.hbs');
require('select2');

module.exports = Marionette.ItemView.extend({
  className: 'form-group',
  template: template,

  events: {
    'select2-selecting': 'onSelect2Selecting'
  },

  ui: {
    'input': 'input'
  },

  onMouseenter: function (event) {
    var button = $(event.currentTarget);
    button.children('span').hide();
    button.children('i').removeClass('hidden');
  },

  onMouseleave: function (event) {
    var button = $(event.currentTarget);
    button.children('span').show();
    button.children('i').addClass('hidden');
  },

  onSelect2Open: function () {
    $('#select2-drop')
      .on('mouseenter', 'a', this.onMouseenter)
      .on('mouseleave', 'a', this.onMouseleave);
  },

  onSelect2Selecting: function (event) {
    event.preventDefault();
    Backbone.history.navigate('venues/' + event.val, {trigger: true});
    this.ui.input.select2('close');
    this.$(':focus').blur();
  },

  onShow: function () {
    _.bindAll(this, 'onSelect2Open');

    var PAGE_SIZE = 50;
    var venueList = this.model.get('venuesList');
    this.ui.input.select2({
      multiple: true,
      formatResult: function (object) {
        return selectResultTemplate(object);
      },
      query: function (options) {
        var i,
          results = [],
          pushResult = function (i) {
            var name = venueList[i];
            return results.push({
              id: name,
              venueName: name
            });
          };
        var re = new RegExp(options.term, 'i');
        for (i = options.context || 0; i < venueList.length; i++) {
          if (!options.term ||
              venueList[i].search(re) !== -1 ||
              venueList[i].search(re) !== -1) {
            if (pushResult(i) === PAGE_SIZE) {
              i++;
              break;
            }
          }
        }
        options.callback({
          context: i,
          more: i < venueList.length,
          results: results
        });
      }
    });

    this.ui.input.one('select2-open', this.onSelect2Open);
  }
});
