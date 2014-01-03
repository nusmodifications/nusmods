define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  var ModuleView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#module-template').html()),

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return ModuleView;
});
