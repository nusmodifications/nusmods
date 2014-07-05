define([
  'backbone.marionette',
  'hbs!../templates/team'
],

function(Marionette, template) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template
  });
});
