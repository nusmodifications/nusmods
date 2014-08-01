'use strict';

var Backbone = require('backbone');
var _ = require('underscore');

var dayIndex = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5
};

var typeAbbrev = {
  'Design Lecture': 'DLEC',
  Laboratory: 'LAB',
  Lecture: 'LEC',
  'Packaged Lecture': 'PLEC',
  'Packaged Tutorial': 'PTUT',
  Recitation: 'REC',
  'Sectional Teaching': 'SEC',
  'Seminar-Style Module Class': 'SEM',
  Tutorial: 'TUT',
  'Tutorial Type 2': 'TUT2',
  'Tutorial Type 3': 'TUT3'
};

// Common terminology throughout project is to refer to lessons instead of
// classes, as class is a keyword in JavaScript.
module.exports = Backbone.Model.extend({
  initialize: function () {
    // Duration is in number of half hours.
    this.set('duration', Math.round(((this.get('EndTime') === '0000' ?
      '2400' : this.get('EndTime')) - this.get('StartTime')) / 50));
    this.set('typeAbbrev', this.constructor.typeAbbrev[this.get('LessonType')]);
    var weekText = this.get('WeekText');
    // If week is not 'Every Week', 'Odd Weeks' or 'Even Weeks', is string
    // 1,4,9 or 1-6 etc, present as 'Weeks 1,4,9'.
    this.set('weekStr', weekText.indexOf('Week') !== -1 ? weekText : 'Weeks ' + weekText);
    this.set('dayAbbrev', this.get('DayText').slice(0, 3).toLowerCase());
    this.set('dayIndex', dayIndex[this.get('DayText')]);
    // For certain display purposes. Don't show week if it's Every Week.
    this.set('weekStrNoEvery', weekText === 'Every Week' ? '' : this.get('weekStr'));
  }
}, {
  typeAbbrev: typeAbbrev,
  typeAbbrevInverse: _.invert(typeAbbrev)
});
