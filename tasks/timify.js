'use strict';

module.exports = {
  convertTimeToIndex: function (time) {
    // Converts a 24-hour format time string to an index:
    // 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
    return (parseInt(time.substring(0, 2)) * 2) + (time.substring(2) === '00' ? 0 : 1);
  },
  convertIndexToTime: function (index) {
    // Reverse of convertTimeToIndex
    // 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
    var hour = parseInt(index / 2);
    var minute = (index % 2) === 0 ? '00' : '30';
    return (hour < 10 ? '0' + hour.toString() : hour.toString()) + minute;
  },
  getAllDays: function (index) {
    var daysArray = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return daysArray.slice(0);  // Make a copy
  },
  getSchoolDays: function (index) {
    var daysArray = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysArray.slice(0);  // Make a copy
  },
  getWeekdays: function (index) {
    var daysArray = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    return daysArray.slice(0);  // Make a copy
  }
}
