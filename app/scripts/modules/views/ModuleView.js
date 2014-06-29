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
        var code = module.ModuleCode;

        var disqusPublicKey = "nthJBpACy8Oo1hp52aaQL2eQ9Sp3XjhYuQkEVYe6EmOqCZbcbi88BqJkr2UbTsY0";
        var disqusShortname = "nusmods"; // Replace with your own shortname
        var urlArray = 'link:http://nusmods.com/modules/' + code + '/reviews';

        $.ajax({
          type: 'GET',
          url: "https://disqus.com/api/3.0/threads/set.jsonp",
          data: { api_key: disqusPublicKey, forum : disqusShortname, thread : urlArray },
          cache: false,
          dataType: 'jsonp',
          success: function (result) {
            var number = 0;
            var article = result.response[0];
            if (article) { 
              number = article.posts; 
            }
            $('#disqus-count').html(number);
            
          }
        });

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
      },
      showFullDescription: function ($ev) {
        $('.module-desc').addClass('module-desc-more');
        return false;
      }
    });
  });
