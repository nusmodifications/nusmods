'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');

module.exports = Marionette.Behavior.extend({
  onShow: function () {
    // Module code hover brief info
    $("a[href^='/modules/'").qtip({
      content: {
        text: function(event, api) {
          var NUSMods = require('../../nusmods');
          var ModuleModel = require('../models/ModuleModel');
          
          var reqModuleCode = $(this).text();
          var reqModule = NUSMods.getMod(reqModuleCode).then(function(data) {
            var reqModuleModel = new ModuleModel(data);

            var title = reqModuleModel.get('ModuleTitle') + '\n'
            api.set('content.title', '<strong>' + title + '</strong>');

            var semesters = reqModuleModel.get('semesterNames');
            var offeredIn = _.reduce(semesters, function(a, b) {
              return a + ', ' + b;
            });
            api.set('content.text', 'Offered in: ' + offeredIn);
          });

          return 'Loading...';
        }
      },
      position: {
        effect: 'false',
        my: 'bottom center',
        at: 'top center'
      },
      show: {
        effect: function() {
          $(this).fadeTo(200, 0.85);
        }
      }
    });
  }
});
