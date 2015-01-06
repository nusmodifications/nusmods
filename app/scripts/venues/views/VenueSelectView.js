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
});
