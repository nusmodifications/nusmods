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
        var module = this.model.get('module');
        DISQUS.reset({
          reload: true,
          config: function () {
            var code = module.ModuleCode;
            this.page.identifier = code;
            this.page.title = code + ' ' + module.ModuleTitle + ' · Reviews';
            this.page.url = 'http://nusmods.com/#!/modules/' + code + '/reviews';
          }
        });
      },
      showFullDescription: function ($ev) {
        $('.module-desc').addClass('module-desc-more');
        return false;
      }
    });
  });
