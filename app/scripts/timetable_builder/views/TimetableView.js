define(['underscore', 'backbone.marionette', './LessonView'],
  function(_, Marionette, LessonView) {
  'use strict';

  return Marionette.CollectionView.extend({
    el: $('#timetable'),
    childView: LessonView,
    childViewOptions: function () {
      return {
        parentView: this,
        timetable: this.collection
      };
    },

    events: {
      'mousemove': 'mouseMove',
      'mouseleave': 'mouseLeave'
    },

    initialize: function() {
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

    attachBuffer: function () {
    },

    attachHtml: function () {
    }
  });
});
