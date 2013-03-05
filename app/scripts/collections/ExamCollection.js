define(['backbone', 'models/ExamModel'], function(Backbone, Exam) {
  'use strict';

  var ExamCollection = Backbone.Collection.extend({
    model: Exam,

    // Sort by custom key: if have exam, month then date then clustered hour,
    // if not, sort alphabetically by code. As the numerical keys come before
    // the alphabetical ones, modules with no exam will appear at the bottom,
    // as intended.
    comparator: function(exam) {
      return exam.get('key');
    }
  });

  return ExamCollection;
});