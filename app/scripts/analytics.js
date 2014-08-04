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
    ga('set', 'page', gaFragment);
    ga('send', 'pageview', gaFragment);
  }
  return matched;
};

module.exports = {
  set: function () {
    Array.prototype.unshift.call(arguments, 'set');
    ga.apply(null, arguments);
  },
  track: function () {
    Array.prototype.unshift.call(arguments, 'send', 'event');
    ga.apply(null, arguments);
  }
};
