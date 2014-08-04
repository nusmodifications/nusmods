'use strict';

var Backbone = require('backbone');

var loadUrl = Backbone.History.prototype.loadUrl;

Backbone.History.prototype.loadUrl = function() {
  var matched = loadUrl.apply(this, arguments);
  var gaFragment = this.fragment;

  if (!/^\//.test(gaFragment)) {
    gaFragment = '/' + gaFragment;
  }

  var ga = window.ga;

  if (typeof ga !== 'undefined') {
    ga('send', 'pageview', gaFragment);
  }
  return matched;
};
