'use strict';

var $ = require('jquery');
var App = require('../../app');
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
    var venues_list = this.model.get('venuesList');
    this.ui.input.select2({
      multiple: true,
      formatResult: function (object) {
        return selectResultTemplate(object);
      },
      query: function (options) {
        var i,
          results = [],
          pushResult = function (i) {
            var name = venues_list[i];
            return results.push({
              id: name,
              venue_name: name
            });
          };
        if (options.term) {
          var re = new RegExp(options.term, 'i');
          for (i = options.context || 0; i < venues_list.length; i++) {
            if (venues_list[i].search(re) !== -1 || venues_list[i].search(re) !== -1) {
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
          more: i < venues_list.length,
          results: results
        });
      }
    });

    this.ui.input.one('select2-open', this.onSelect2Open);
  }
});
