define(['underscore', 'backbone', 'views/FilterView'],
  function(_, Backbone, FilterView) {
  'use strict';

  var FacetView = Backbone.View.extend({
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.model.get('filters').each(function (filter) {
        this.$el.append((new FilterView({model: filter}).render().el));
      }, this);
      return this;
    }
  });

  return FacetView;
});
