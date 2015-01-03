'use strict';

var Marionette = require('backbone.marionette');
var _ = require('underscore');
var $ = require('jquery');
var template = require('../templates/bidding_stats.hbs');

var studentAcctTypeMapping = {
  'Returning Students [P]': function (stat, student) {
    return (stat.Faculty === student.faculty &&
            student.accountType === 'P' &&
            !student.newStudent);
  },
  'New Students [P]': function (stat, student) {
    return (stat.Faculty === student.faculty &&
            student.accountType === 'P' &&
            student.newStudent);
  },
  'NUS Students [P]': function (stat, student) {
    return (stat.Faculty === student.faculty &&
            student.accountType === 'P');
  },
  'Returning Students and New Students [P]': function (stat, student) {
    return (stat.Faculty === student.faculty &&
            student.accountType === 'P');
  },
  'NUS Students [G]': function (stat, student) {
    return (student.accountType === 'G');
  },
  'Returning Students [P] and NUS Students [G]': function (stat, student) {
    return (stat.Faculty === student.faculty &&
            student.accountType === 'P' &&
            !student.newStudent) ||
           (stat.Faculty !== student.faculty && student.accountType === 'G');
  },
  'NUS Students [P, G]': function (stat, student) {
    return (stat.Faculty === student.faculty &&
            student.accountType === 'P') ||
           (stat.Faculty !== student.faculty && student.accountType === 'G');
  },
  'Reserved for [G] in later round': function (stat, student) {
    return (stat.Faculty !== student.faculty && student.accountType === 'G');
  },
  'Not Available for [G]': function (stat, student) {
    return (stat.Faculty === student.faculty && student.accountType === 'P');
  }
};

function determineStatRelevance (stat, student) {
  return studentAcctTypeMapping[stat.StudentAcctType](stat, student);
}

module.exports = Marionette.CompositeView.extend({
  template: template,
  filterStats: function (faculty, accountType, newStudent) {
    var stats = this.model.attributes.stats;
    _.each(stats, function (semester) {
      semester.shortName = semester.Semester.replace(/20/g, '');
      semester.tabId = semester.shortName.replace(/AY|\//g, '')
                                         .replace(/ Sem /, 's')
                                         .replace(/^/, 'js-nm-bid-stat-');
      semester.BiddingStats = _.filter(semester.BiddingStats, function (stat) {
        return determineStatRelevance(stat, {
          faculty: faculty,
          accountType: accountType,
          newStudent: newStudent
        });
      });
    });
  },
  onShow: function () {
    $('.js-nm-bid-stat-tabs li:eq(1) a').tab('show');
  }
});
