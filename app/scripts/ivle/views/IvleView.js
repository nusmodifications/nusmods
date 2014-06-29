define([
  'backbone.marionette',
  'hbs!../templates/ivle'
],

function(Marionette, template) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template
  });
});
