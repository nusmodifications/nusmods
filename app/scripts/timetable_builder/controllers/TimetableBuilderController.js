define(['require', 'app', 'backbone.marionette', 'localforage'],
  function (require, App, Marionette, localforage) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Timetable',
      icon: 'table',
      url: '/timetable-builder'
    });

    var timetableBuilderView;

    return Marionette.Controller.extend({
      showTimetableBuilder: function (options) {
        require(['../views/TimetableBuilderView'],
          function (TimetableBuilderView) {
            navigationItem.select();
            timetableBuilderView = new TimetableBuilderView();
            App.mainRegion.show(timetableBuilderView);
            if (options) {
              options = JSON.parse(decodeURIComponent(options));
              timetableBuilderView.setOptions(options);
            } else {
              localforage.getItem('timetableBuilderOptions',
                function (options) {
                  timetableBuilderView.setOptions(options);
                });
            }
          });
      }
    });
  });
