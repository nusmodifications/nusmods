define(['backbone.marionette', './ModuleView', 'hbs!../templates/modules'],
  function (Marionette, ModuleView, template) {
    'use strict';

    return Marionette.CompositeView.extend({
      itemView: ModuleView,
      itemViewContainer: 'tbody',
      template: template
    });
  });
