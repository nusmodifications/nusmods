define(['backbone', 'common/utils/padTwo'], function(Backbone, padTwo) {
  'use strict';

  // Convert exam in Unix time to 12-hour date/time format. We add 8 hours to
  // the UTC time, then use the getUTC* methods so that they will correspond to
  // Singapore time regardless of the local time zone.
  var examStr = function(exam) {
    if (exam) {
      var date = new Date(exam + 288e5);
      var hours = date.getUTCHours();
      return padTwo(date.getUTCDate()) +
        '-' + padTwo(date.getUTCMonth() + 1) +
        '-' + date.getUTCFullYear() +
        ' ' + (hours % 12 || 12) +
        ':' + padTwo(date.getUTCMinutes()) +
        ' ' + (hours < 12 ? 'AM' : 'PM');
    }
    return null;
  };

  var Module = Backbone.Model.extend({
    initialize: function() {
      this.set('examStr', examStr(this.get('exam')));
    }
  });

  return Module;
});
