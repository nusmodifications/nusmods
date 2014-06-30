define(['underscore', 'backbone', '../models/ExamModel'],
  function(_, Backbone, Exam) {
  'use strict';

  return Backbone.Collection.extend({
    model: Exam,

    initialize: function (models, options) {
      this.clashCount = 0;
      this.listenTo(this, {add: this.onAdd, remove: this.onRemove});

      options.modules.each(_.bind(this.addModule, this));

      this.listenTo(options.modules, {
        add: this.addModule,
        remove: function (module) {
          this.remove(this.get(module.id));
        }
      });
    },

    addModule: function (module) {
      this.add({
        color: module.get('color'),
        id: module.id,
        time: module.get('examStr'),
        title: module.get('title'),
        unixTime: module.get('exam')
      });
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
