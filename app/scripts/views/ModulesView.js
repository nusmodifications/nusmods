define([
  'backbone',
  'views/ModuleView'
],

function(Backbone, ModuleView) {
  'use strict';

  var ModulesView = Backbone.View.extend({
    el: $('.modules > tbody'),

    initialize: function() {
      this.listenTo(this.collection, 'add', this.add);
    },

    add: function(module) {
      this.$el.append((new ModuleView({model: module})).render().el);
    }
  });

  return ModulesView;
});
