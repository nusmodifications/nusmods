define(['underscore', 'backbone', './LessonView'],
  function(_, Backbone, LessonView) {
  'use strict';

  var TimetableView = Backbone.View.extend({
    el: $('#timetable'),

    events: {
      'mousemove': 'mouseMove',
      'mouseleave': 'mouseLeave'
    },

    initialize: function() {
      this.listenTo(this.collection, 'add', this.add);
      this.listenTo(this.collection, 'remove', this.remove);

      this.$colgroups = this.$('colgroup');
    },

    mouseMove: function(evt) {
      if (!this.colX) {
        this.colX = this.$('#mon > tr:last-child > td')
          .filter(':even')
          .map(function() { return $(this).offset().left; })
          .get();
      }

      var currCol = this.$colgroups.eq(_.sortedIndex(this.colX, evt.pageX));
      if (!currCol.is(this.prevCol)) {
        if (this.prevCol) {
          this.prevCol.removeAttr('class');
        }
        currCol.addClass('hover');
        this.prevCol = currCol;
      }
    },

    mouseLeave: function() {
      if (this.prevCol) {
        this.prevCol.removeAttr('class');
        this.prevCol = false;
      }
    },

    add: function(lesson, collection, options) {
      lesson.view = (new LessonView({model: lesson, timetable: this.collection})).render();
    },

    remove: function(lesson, collection) {
      lesson.view.remove();
    }
  });

  return TimetableView;
});
