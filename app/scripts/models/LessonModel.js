define(['timetableData', 'backbone'], function(timetableData, Backbone) {
  'use strict';

  // Common terminology throughout project is to refer to lessons instead of
  // classes, as class is a keyword in JavaScript.
  var Lesson = Backbone.Model.extend({
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    daysAbbrev: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],

    lessonTypes: ['Design Lecture', 'Laboratory', 'Lecture', 'Packaged Lecture',
      'Packaged Tutorial', 'Recitation', 'Sectional Teaching',
      'Seminar-Style Module Class', 'Tutorial', 'Tutorial Type 2',
      'Tutorial Type 3'],

    typeAbbrev: ['DLEC', 'LAB', 'LEC', 'PLEC', 'PTUT', 'REC', 'SEC', 'SEM', 'TUT',
      'TUT2', 'TUT3'],

    weeks: ['Every Week', 'Odd Weeks', 'Even Weeks'],

    initialize: function() {
      // Duration is in number of half hours.
      this.set('duration', Math.round(((this.get('end') === '0000' ?
          '2400' : this.get('end')) - this.get('start')) / 50));
      this.set('typeName', this.lessonTypes[this.get('type')]);
      this.set('typeAbbrev', this.typeAbbrev[this.get('type')]);
      // If week is integer, corresponds to index of
      // ['Every Week', 'Odd Weeks', 'Even Weeks']. If not, is string 1,4,9 or
      // 1-6 etc, present as 'Weeks 1,4,9'.
      this.set('weekStr', typeof this.get('week') === 'number' ?
          this.weeks[this.get('week')] : 'Weeks ' + this.get('week'));
      // Short code is first component of module with multiple codes, e.g.
      // GEK2003 for GEK2003 / PS2249 / SSA2209.
      this.set('shortCode', this.get('code').split(' ')[0]);
      // Corresponding query string is short code = type index in hexadecimal
      // and group name, e.g. ACC2002=8B01.
      this.set('queryString', this.get('shortCode') + '=' +
          (this.get('type') === '10' ? 'A' : this.get('type')) + this.get('group'));
      this.set('dayAbbrev', this.daysAbbrev[this.get('day')]);
      // For certain display purposes. Don't show week if it's Every Week.
      this.set('weekStrNoEvery', this.get('week') ? this.get('weekStr') : '');
      this.set('dayStr', this.days[this.get('day')]);
    },

    get: function (attr) {
      if (_.isFunction(this[attr])) {
        return this[attr]();
      }
      return Backbone.Model.prototype.get.call(this, attr);
    }
  });

  return Lesson;
});