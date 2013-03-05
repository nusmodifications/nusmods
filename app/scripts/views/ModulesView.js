define([
  'backbone',
  'views/ModuleView'
],

function(Backbone, ModuleView) {
  'use strict';

  var ModulesView = Backbone.View.extend({
    el: $('.modules > tbody'),

    initialize: function() {
      this.collection.on('add', this.add, this);
    },

    add: function(module) {
      this.$el.append((new ModuleView({model: module})).render().el);
    }
  });

  return ModulesView;
});