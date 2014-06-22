define(['backbone', 'underscore', 'common/utils/padTwo'], function(Backbone, _, padTwo) {
  'use strict';

  // Convert exam in Unix time to 12-hour date/time format. We add 8 hours to
  // the UTC time, then use the getUTC* methods so that they will correspond to
  // Singapore time regardless of the local time zone.
  var examStr = function (exam) {
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

  var DESCRIPTION_LIMIT = 40;

  var shortenDescription = function (desc) {
    return desc.split(' ').splice(0, DESCRIPTION_LIMIT).join(' ');
  }

  var workloadify = function (workload) {
    var workloadArray = workload.split('-');
    var workloadComponents = {
      lectureHours: workloadArray[0],
      tutorialHours: workloadArray[1],
      labHours: workloadArray[2],
      projectHours: workloadArray[3],
      preparationHours: workloadArray[4]
    };
    _.each(workloadComponents, function (value, key) {
      workloadComponents[key] = parseInt(value);
    });
    return workloadComponents;
  }

  return Backbone.Model.extend({
    idAttribute: 'code',
    initialize: function() {
      this.set('examStr', examStr(this.get('exam')));
      var description = this.get('description');
      if (description && description.split(' ').length > DESCRIPTION_LIMIT + 10) {
        this.set('shortDescription', shortenDescription(this.get('description')));
      }
      var workload = this.get('workload');
      if (workload) {
        this.set('workloadComponents', workloadify(workload));
      }
    }
  });
});
