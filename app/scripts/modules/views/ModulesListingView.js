define(['backbone.marionette', './ModuleItemView', 'hbs!../templates/modules_listing'],
  function (Marionette, ModuleView, template) {
    'use strict';

    return Marionette.CompositeView.extend({
      tagName: 'table',
      className: 'table table-bordered table-striped',
      childView: ModuleView,
      childViewContainer: 'tbody',
      template: template
    });
  });
