define(['backbone.marionette', 'hbs!../templates/module', 'bootstrap'],
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
        var code = module.ModuleCode;

        var disqusShortname = 'nusmods';

        (function() {
          if (typeof disqus_domain != 'undefined') {
            DISQUSWIDGETS.domain = 'disqus.com';
          }
          DISQUSWIDGETS.forum = disqusShortname;
          DISQUSWIDGETS.getCount();
        })();

        if (this.model.get('section') === 'reviews') {
          // Only reset Disqus when showing reviews section
          DISQUS.reset({
            reload: true,
            config: function () {
              this.page.identifier = code;
              this.page.title = code + ' ' + module.ModuleTitle + ' · Reviews';
              this.page.url = 'http://nusmods.com/modules/' + code + '/reviews';
            }
          });
        }
        $('.nm-help').tooltip();

        // So that users can use keyboard shortcuts immediately after the page loads
        $('input').blur();
      },
      showFullDescription: function ($ev) {
        $('.module-desc').addClass('module-desc-more');
        return false;
      }
    });
  });
