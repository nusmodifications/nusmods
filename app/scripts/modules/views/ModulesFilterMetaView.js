'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var template = require('../templates/modules_filter_meta.hbs');

module.exports = Marionette.CompositeView.extend({
  template: template,
  initialize: function () {
    this.parseSelectedFilters();
  },
  events: {
    'click button': function(event) {
      var deselectedFilter = event.target.getAttribute('data-filter');
      var selector = "input[data-filter='" + deselectedFilter + "']";
      $(selector).click();
    }
  },
  parseSelectedFilters: function () {
    var selectedFilters = this.model.get('selectedFilters');
    var selectedFiltersParsed = _.map(selectedFilters, function (value, key) {
      return {
        type: key,
        options: value
      };  
    });
    this.model.set('selectedFiltersParsed', selectedFiltersParsed);
  },
  updateView: function (selectedFilters, resultsLength) {
    this.model.set('selectedFilters', selectedFilters);
    this.model.set('resultsLength', resultsLength);
    this.parseSelectedFilters();
    this.render();
  }
});
