'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');

module.exports = Marionette.Behavior.extend({
  events: {
    'mouseenter a[href^=\'/modules/\']' : 'showDetails',
    'click a[href^=\'/modules/\']': 'destroyDetails'
  },

  showDetails: function (event) {
    var curr = event.currentTarget;

    var NUSMods = require('../../nusmods');
    var ModuleModel = require('../models/ModuleModel');

    var reqModuleCode = $(curr).text();

    $(curr).qtip({
      content: function (event, api) {
        NUSMods.getMod(reqModuleCode).then(function(data) {
          var reqModuleModel = new ModuleModel(data);

          var title = reqModuleModel.get('ModuleTitle');
          var semesters = reqModuleModel.get('semesterNames');
          var offeredIn = _.reduce(semesters, function(a, b) {
            return a + ', ' + b;
          });

          api.set('content.title', '<strong>' + title + '</strong>');
          api.set('content.text', 'Offered in: ' + offeredIn);
        });
        return 'Loading...';
      },
      show: {
        event: event.type,
        ready: true
      },
      position: {
        effect: 'false',
        my: 'bottom center',
        at: 'top center'
      },
      events: {
        show: function (event) {
          // Prevents tags with data-no-module-qtip from loading
          if (curr.hasAttribute('data-no-module-qtip')) {
            event.preventDefault();
          }
        }
      }
    }, event);
  },
  destroyDetails: function (event) {
    var curr = event.currentTarget;
    $(curr).qtip('destroy', true);
  }
});

