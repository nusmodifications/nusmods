define(['underscore', 'backbone', 'models/ExamModel'],
  function(_, Backbone, Exam) {
  'use strict';

  return Backbone.Collection.extend({
    model: Exam,

    initialize: function () {
      this.clashCount = 0;

      this.on('add', this.onAdd, this);
      this.on('remove', this.onRemove, this);
    },

    onAdd: function (exam) {
      // Compute clashes based on keys with clustered hours.
      var clashes = this.where({key: exam.get('key')});
      if (clashes.length > 1) {
        // If clash found, set clash property on all of them.
        _.each(clashes, function(clash) {
          clash.set('clash', true);
        });
        this.clashCount++;
      }
    },

    onRemove: function(exam) {
      if (exam.get('clash')) {
        var clashes = this.where({key: exam.get('key')});
        if (clashes.length === 1) {
          clashes[0].set('clash', false);
        }
        this.clashCount--;
      }
    },

    // Sort by custom key: if have exam, month then date then clustered hour,
    // if not, sort alphabetically by code. As the numerical keys come before
    // the alphabetical ones, modules with no exam will appear at the bottom,
    // as intended.
    comparator: function(exam) {
      return exam.get('key');
    }
  });
});
