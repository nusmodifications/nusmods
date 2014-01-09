define(['backbone.marionette', './ExamView'],
  function (Marionette, ExamView) {
    'use strict';

    return Marionette.CollectionView.extend({
      el: $('#exam-timetable > tbody'),
      itemView: ExamView,

      collectionEvents: {
        'add remove': function() {
          $('#clash').toggleClass('hidden', !this.collection.clashCount);
        }
      },

      appendHtml: function (collectionView, itemView, index) {
        var childrenContainer = collectionView.$el;
        var children = childrenContainer.children();
        if (children.size() <= index) {
          childrenContainer.append(itemView.el);
        } else {
          children.eq(index).before(itemView.el);
        }
      }
    });
  });
