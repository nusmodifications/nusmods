define(['backbone', 'timetableData'], function(Backbone, timetableData) {
  'use strict';

  var AppView = Backbone.View.extend({
    el: 'body',

    events: {
      'show a[href="#module-finder"]': 'showModuleFinder',
      'show a[href="#timetable-builder"]': 'showTimetableBuilder'
    },

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

      $('#correct-as-at').text(timetableData.correctAsAt);

      $('.container-fluid').show();
    },

    showModuleFinder: function() {
      Backbone.history.navigate('modules');
      $('#selected-mods').prependTo('#module-finder .span3');
    },

    showTimetableBuilder: function() {
      Backbone.history.navigate('timetable');
      $('#selected-mods').appendTo('#show-hide-selected-mods-container');
    }
  });

  return AppView;
});