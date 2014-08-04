'use strict';

var Backbone = require('backbone');

// Initializing dimension values may be asynchronous, so we need to queue up
// analytics calls in the meantime. Once initialization is complete, flush()
// should be called, after which analytics calls will execute immediately as
// usual.
var argumentsQueue = [];

var ga = function (methodName, fieldName) {
  if (methodName === 'set' && /^dimension\d+$/.test(fieldName)) {
    window.ga.apply(null, arguments);
  } else {
    argumentsQueue.push(arguments);
  }
};

var loadUrl = Backbone.History.prototype.loadUrl;

Backbone.History.prototype.loadUrl = function() {
  var matched = loadUrl.apply(this, arguments);
  var gaFragment = this.fragment;

  if (!/^\//.test(gaFragment)) {
    gaFragment = '/' + gaFragment;
  }

  ga('set', 'page', gaFragment);
  ga('send', 'pageview', gaFragment);

  return matched;
};

module.exports = {
  flush: function () {
    ga = window.ga;
    for (var i = 0; i < argumentsQueue.length; i++) {
      ga.apply(null, argumentsQueue[i]);
    }
    argumentsQueue = [];
  },
  set: function () {
    Array.prototype.unshift.call(arguments, 'set');
    ga.apply(null, arguments);
  },
  track: function () {
    Array.prototype.unshift.call(arguments, 'send', 'event');
    ga.apply(null, arguments);
  }
};
