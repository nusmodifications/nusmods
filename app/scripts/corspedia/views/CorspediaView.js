define([
  'underscore',
  'backbone.marionette',
  'hbs!../templates/corspedia',
  'localforage'
],

function(_, Marionette, template, localforage) {
  'use strict';

  var CorspediaView = Marionette.Layout.extend({
    template: template,
    initialize: function() {
      
    }, 
    events: {
      
    }
  });

  return CorspediaView;
});
