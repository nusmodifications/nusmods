define(['backbone.marionette', './ExamView', 'hbs!../templates/exams'],
  function (Marionette, ExamView, template) {
    'use strict';

    return Marionette.CompositeView.extend({
      tagName: 'table',
      className: 'table table-bordered table-condensed',
      childView: ExamView,
      childViewContainer: 'tbody',
      template: template,

      collectionEvents: {
        'add remove': function() {
          $('#clash').toggleClass('hidden', !this.collection.clashCount);
        }
      },

      attachBuffer: function () {
      },

      attachHtml: function (compositeView, childView, index) {
        var childrenContainer = this.getChildViewContainer(compositeView);
        var children = childrenContainer.children();
        if (children.size() <= index) {
          childrenContainer.append(childView.el);
        } else {
          children.eq(index).before(childView.el);
        }
      }
    });
  });
