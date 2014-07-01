define(['backbone', 'nusmods'], function (Backbone, NUSMods) {
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
    }
  });
});
