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
      this.set('key', this.id);
    }

    this.set('moduleCredit', this.getModuleCredit(this));
  },

  getModuleCredit: function(module) {
    var moduleCredit = parseInt(module.get('moduleCredit'));
    moduleCredit = module.get('ModuleTitle').match(/dissertation/i) ? moduleCredit / 2 : moduleCredit
    return moduleCredit;
  }
});
