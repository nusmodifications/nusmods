'use strict';

var Backbone = require('backbone');
var Lesson = require('../models/LessonModel');

module.exports = Backbone.Collection.extend({
  model: Lesson
});
