define(['backbone'], function(Backbone) {
  'use strict';

  var FilterView = Backbone.View.extend({
    template: _.template($('#filter-template').html()),

    initialize: function() {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
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