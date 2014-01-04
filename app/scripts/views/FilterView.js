define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  var FilterView = Backbone.View.extend({
    template: _.template($('#filter-template').html()),

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      _.each(this.model.get('groupedCollection'), function(modules, key) {
        this.$el.append(this.template({
          count: modules.length,
          label: key
        }));
      }, this);
      return this;
    }
  });

  return FilterView;
});
