define([
  'underscore',
  'backbone.marionette',
  'hbs!../templates/preferences'
],

function(_, Marionette, template) {
  'use strict';

  var PreferenceView = Marionette.Layout.extend({
    template: template
  });

  return PreferenceView;
});
