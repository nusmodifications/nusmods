define(['backbone.marionette', 'hbs!../templates/module',  'underscore', 'localforage', 'bootstrap'],
  function (Marionette, template, _, localforage) {
    'use strict';

    return Marionette.ItemView.extend({
      template: template,
      initialize: function (data) {
        var formElements = {
          'faculty': '#faculty',
          'student': 'input:radio[name="student-radios"]',
          'account': '#account'
        }
        _.each(formElements, function (selector, item) {
          localforage.getItem(item, function (value) {
            if (value) {
              $(selector).val([value]); 
            }
          })
        });
      },
      events: {
        'change #faculty, input:radio[name="student-radios"], #account': 'updateCorspedia',
        'click .show-full-desc': 'showFullDescription',
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
      },
      updateCorspedia: function ($ev) {
        var $target = $($ev.target);
        $target.blur();
        var property = $target.attr('data-pref-type');
        var value = $target.val();
        console.log(property, value);

        if (property === 'faculty' && value === 'default') {
          alert('You have to select a faculty.');
          localforage.getItem(property, function (value) {
            $('#faculty').val(value);
          });
          return;
        }
        localforage.setItem(property, value);
      }
    });
  });
