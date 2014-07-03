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
      }
    });
  });
