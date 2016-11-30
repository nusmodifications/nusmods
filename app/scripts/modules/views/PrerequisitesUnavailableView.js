'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');

module.exports = Marionette.LayoutView.extend({
  template: _.template('<p>Prerequisites are not available.</p>'),
});
