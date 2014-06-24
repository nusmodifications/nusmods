define(['backbone.marionette', './ModuleItemView', 'hbs!../templates/modules_listing'],
  function (Marionette, ModuleItemView, template) {
    'use strict';

    return Marionette.CompositeView.extend({
      tagName: 'table',
      className: 'table table-bordered table-striped',
      childView: ModuleItemView,
      childViewContainer: 'tbody',
      template: template
    });
  });
