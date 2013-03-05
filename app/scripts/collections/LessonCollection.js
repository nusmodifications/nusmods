define(['backbone', 'models/LessonModel'], function(Backbone, Lesson) {
  'use strict';

  var LessonCollection = Backbone.Collection.extend({
    model: Lesson
  });

  return LessonCollection;
});