define(['backbone', 'nusmods', 'mousetrap', '../utils/modulify', 'underscore'], 
  function (Backbone, NUSMods, Mousetrap, modulify, _) {
  'use strict';

  return Backbone.View.extend({
    el: 'body',

    events: {
      'click a[href]:not([data-bypass])': 'hijackLinks'
    },

    // Ref: https://github.com/backbone-boilerplate/backbone-boilerplate/blob/85723839dbab6787d69eedcbbea05e1d59960eff/app/app.js#L52
    hijackLinks: function (event) {
      // Do not hijack if modifier key was pressed when the event fired.
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      // Get the absolute anchor href.
      var $link = $(event.currentTarget);
      var href = { prop: $link.prop('href'), attr: $link.attr('href') };
      // Get the absolute root.
      var root = location.protocol + '//' + location.host + '/';

      // Ensure the root is part of the anchor href, meaning it's relative.
      if (href.prop.slice(0, root.length) === root) {
        // Stop the default event to ensure the link will not cause a page
        // refresh.
        event.preventDefault();

        if (href.attr === '/') {
          window.location = root;
        } else {
          // `Backbone.history.navigate` is sufficient for all Routers and will
          // trigger the correct events. The Router's internal `navigate` method
          // calls this anyways.  The fragment is sliced from the root.
          Backbone.history.navigate(href.attr, {trigger: true});
        }
      }
    },

    initialize: function () {
      $.ajaxSetup({
        cache: true
      });

      // [Override](http://craigsworks.com/projects/qtip2/tutorials/advanced/#override)
      // default tooltip settings.
      $.fn.qtip.defaults.position.my = 'bottom center';
      $.fn.qtip.defaults.position.at = 'top center';
      $.fn.qtip.defaults.position.viewport = true;
      $.fn.qtip.defaults.show.solo = true;
      $.fn.qtip.defaults.style.classes = 'qtip-bootstrap';

      NUSMods.getCorrectAsAt().then(function (correctAsAt) {
        $('#correct-as-at').text(new Date(correctAsAt));
      });

      $('.container').removeClass('hidden');

      Mousetrap.bind('/', function(ev) {
        $('#s2id_autogen2').focus();
        ev.preventDefault();
        return false;
      });

      var keyboardNavigationMappings = {
        b: '/timetable-builder',
        m: '/modules',
        p: '/preferences',
        c: '/modules/<module>/corspedia',
        t: '/modules/<module>/timetable',
        r: '/modules/<module>/reviews',
      };

      _.each(keyboardNavigationMappings, function (value, key) {
        Mousetrap.bind(key, function (ev) {
          if (value.indexOf('<module>') > -1) {
            var modulePage = true;
            var moduleCode = modulify.getModuleFromString(window.location.href);
          }
          if (moduleCode || !modulePage) {
            Backbone.history.navigate(value.replace('<module>', moduleCode ? moduleCode : ''), {trigger: true});
          }
        });
      })
    }
  });
});
