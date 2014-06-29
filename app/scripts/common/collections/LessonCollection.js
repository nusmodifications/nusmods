define(['backbone', '../models/LessonModel'], function(Backbone, Lesson) {
  'use strict';

  return Backbone.Collection.extend({
    model: Lesson
  });
});
