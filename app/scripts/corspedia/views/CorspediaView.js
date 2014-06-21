define([
  'underscore',
  'backbone.marionette',
  'hbs!../templates/corspedia',
  'localforage'
],

function(_, Marionette, template, localforage) {
  'use strict';

  var CorspediaView = Marionette.LayoutView.extend({
    template: template,
    initialize: function() {
      
    }, 
    events: {
      
    }
  });

  return CorspediaView;
});
