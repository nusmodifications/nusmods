define(['backbone.marionette', 'hbs!../templates/module'],
  function (Marionette, template) {
    'use strict';

    return Marionette.ItemView.extend({
      template: template,
      initialize: function (data) {

      },
      events: {
        'click .show-full-desc': 'showFullDescription'
      },
      onShow: function () {
        var code = this.model.get('module').ModuleCode;
        DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = code;
            this.page.url = window.location.href;
          }
        });
      },
      showFullDescription: function ($ev) {
        $('.module-desc').addClass('module-desc-more');
        return false;
      }
    });
  });
