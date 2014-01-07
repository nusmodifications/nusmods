define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  var FilterView = Backbone.View.extend({
    tagName: 'label',
    className: 'checkbox-inline',
    template: _.template($('#filter-template').html()),

    events: {
      'click :checkbox': 'toggleSelected'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    toggleSelected: function() {
      this.model.toggleSelected();
    }
  });

  return FilterView;
});
