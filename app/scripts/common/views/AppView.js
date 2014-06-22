define(['backbone', 'nusmods'], function(Backbone, NUSMods) {
  'use strict';

  return Backbone.View.extend({
    el: 'body',

    initialize: function() {
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

      NUSMods.getCorrectAsAt(function (correctAsAt) {
        $('#correct-as-at').text(correctAsAt);
      });

      $('.container').removeClass('hidden');
    }
  });
});
