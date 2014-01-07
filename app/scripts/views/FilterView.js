define(['backbone.marionette'], function (Marionette) {
  'use strict';

  return Marionette.ItemView.extend({
    tagName: 'label',
    className: 'checkbox-inline',
    template: '#filter-template',

    events: {
      'click :checkbox': function () {
        this.model.toggleSelected();
      }
    }
  });
});
