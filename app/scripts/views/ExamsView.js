define(['backbone', 'views/ExamView'], function(Backbone, ExamView) {
  'use strict';

  var ExamsView = Backbone.View.extend({
    clashCount: 0,
    el: $('#exam-timetable > tbody'),

    initialize: function() {
      this.collection.on('add', this.add, this);
      this.collection.on('remove', this.remove, this);
    },

    add: function(exam, collection, options) {
      var el = (new ExamView({model: exam})).render().el;
      if (options.index) {
        // If index > 0, insert after row with index - 1.
        this.$el.children().eq(options.index - 1).after(el);
      } else {
        // If index == 0, prepend to table.
        this.$el.prepend(el);
      }

      // Compute clashes based on keys with clustered hours.
      var clashes = collection.where({key: exam.get('key')});
      if (clashes.length > 1) {
        // If clash found, set clash property on all of them.
        _.each(clashes, function(clash) {
          clash.set('clash', true);
        });
        // If clashCount was originally 0, is first clash, show #clash.
        if (!this.clashCount) {
          $('#clash').show();
        }
        this.clashCount++;
      }
    },

    remove: function(exam, collection) {
      if (exam.get('clash')) {
        var clashes = collection.where({key: exam.get('key')});
        if (clashes.length == 1) {
          clashes[0].set('clash', false);
        }
        this.clashCount--;
        if (!this.clashCount) {
          $('#clash').hide();
        }
      }
    }
  });

  return ExamsView;
});
