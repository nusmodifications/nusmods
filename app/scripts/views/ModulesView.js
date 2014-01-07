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
      this.listenTo(this.collection, 'reset', this.reset);
    },

    add: function(module) {
      this.$el.append((new ModuleView({model: module})).render().el);
    },

    reset: function() {
      this.$el.empty();
      this.collection.each(function (module) {
        this.$el.append((new ModuleView({model: module})).render().el);
      }, this);
    }
  });

  return ModulesView;
});
