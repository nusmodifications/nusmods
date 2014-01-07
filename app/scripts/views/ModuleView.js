define(['backbone.marionette'], function (Marionette) {
  'use strict';

  return Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#module-template'
  });
});
