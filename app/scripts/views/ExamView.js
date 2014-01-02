define(['backbone', 'spectrum'], function(Backbone) {
  'use strict';

  var ExamView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#exam-template').html()),

    initialize: function() {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()))
          .addClass('color' + this.model.get('color'));
      if (this.model.get('clash')) {
        this.$el.addClass('clash');
      } else {
        this.$el.removeClass('clash');
      }
      this.$('.color').spectrum();
      return this;
    }
  });

  return ExamView;
});