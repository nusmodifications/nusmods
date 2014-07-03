define([
  'backbone.marionette',
  'hbs!../templates/help'
],

function(Marionette, template) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template
  });
});
