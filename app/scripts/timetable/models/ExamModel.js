'use strict';

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  defaults: {
    clash: false,
    display: true,
    time: 'No Exam'
  },

  initialize: function () {
    // Time is in the dd-mm-yyyy h:mm tt format.
    var time = this.get('examStr');
    if (time) {
      // Hour can only be single digit. 9 AM, 1 PM, 2 PM, 2:30 PM, 5 PM, 7 PM.
      var hour = +time[11];
      // Group based on (9 AM), (1 PM, 2 PM, 2:30 PM), (5 PM, 7 PM) clustering.
      hour = hour > 8 ? 0 : (hour < 5 ? 1 : 2);
      // Sorting key is month then date then clustered hour. Clustering is
      // for computing exam clashes.
      this.set('key', time.slice(3, 5) + time.slice(0, 2) + hour);
    } else {
      // For modules without exam, sort alphabetically by id (code).
      this.set('examStr', this.defaults.time);
      // Add '00' before the module code to force the 'time' to be smaller than others
      this.set('key', '00' + this.id);
    }

    var moduleCredit = this.get('moduleCredit');
    //  For FYP/Dissertations/Thesis, should divide MC by 2.
    //  Have to add in other modules that span across 2 semesters.
    var isMultipleSemester = this.get('ModuleTitle').match(/dissertation/i);
    this.set('semesterModuleCredit', parseInt(isMultipleSemester ? moduleCredit / 2 : moduleCredit));
    this.set('moduleCreditString', isMultipleSemester ? moduleCredit + ' (2 sems)' : moduleCredit);
  }
});
