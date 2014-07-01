define(['backbone.marionette', 'hbs!../templates/bidding_stats', 'underscore'],
  function (Marionette, template, _) {
    'use strict';

    return Marionette.CompositeView.extend({
      template: template,
      filterStats: function (faculty, accountType, newStudent) {
        var stats = this.model.attributes.stats;
        _.each(stats, function (semester) {
          semester.BiddingStats = _.filter(semester.BiddingStats, function (stat) {
            return stat.Faculty === faculty;
          });
        });
      }
    });
  });
