define(['backbone.marionette', './ModuleView', 'hbs!../templates/modules'],
  function (Marionette, ModuleView, template) {
    'use strict';

    return Marionette.CompositeView.extend({
      tagName: 'table',
      className: 'table table-bordered table-striped',
      itemView: ModuleView,
      itemViewContainer: 'tbody',
      template: template
    });
  });
