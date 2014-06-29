define(['underscore', 'backbone.marionette', './LessonView', 'hbs!../templates/timetable'],
  function(_, Marionette, LessonView, template) {
  'use strict';

  return Marionette.CompositeView.extend({
    id: 'timetable',
    tagName: 'table',
    childView: LessonView,
    childViewOptions: function () {
      return {
        parentView: this,
        timetable: this.collection
      };
    },
    template: template,

    events: {
      'mousemove': 'mouseMove',
      'mouseleave': 'mouseLeave'
    },

    ui: {
      colgroups: 'colgroup'
    },

    initialize: function() {
    },

    mouseMove: function(evt) {
      if (!this.colX) {
        this.colX = this.$('#mon > tr:last-child > td')
          .filter(':even')
          .map(function() { return $(this).offset().left; })
          .get();
      }

      var currCol = this.ui.colgroups.eq(_.sortedIndex(this.colX, evt.pageX));
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
