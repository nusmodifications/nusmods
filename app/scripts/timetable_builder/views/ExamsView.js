define(['backbone.marionette', './ExamView', 'hbs!../templates/exams'],
  function (Marionette, ExamView, template) {
    'use strict';

    return Marionette.CompositeView.extend({
      tagName: 'table',
      className: 'table table-bordered table-condensed',
      itemView: ExamView,
      itemViewContainer: 'tbody',
      template: template,

      collectionEvents: {
        'add remove': function() {
          $('#clash').toggleClass('hidden', !this.collection.clashCount);
        }
      },

      appendHtml: function (compositeView, itemView, index) {
        var childrenContainer = compositeView.$itemViewContainer;
        var children = childrenContainer.children();
        if (children.size() <= index) {
          childrenContainer.append(itemView.el);
        } else {
          children.eq(index).before(itemView.el);
        }
      }
    });
  });
