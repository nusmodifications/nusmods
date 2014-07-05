define([
  'backbone.marionette',
  'hbs!../templates/about'
],

function(Marionette, template) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template
  });
});
