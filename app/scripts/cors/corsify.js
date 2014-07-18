'use strict';

var corsSchedule = require('./corsSchedule1415Sem1.json');

var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toUTC(date) {
  var d = Date.UTC(date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  date.getHours(),
                  date.getMinutes(),
                  date.getSeconds(),
                  date.getMilliseconds());
  return d - (8 * 60 * 60 * 1000);
}

function formatTime(date) {
  var start_date = date.split(', ').slice(0, 2);
  var start_hour = (new Date(date)).getHours();
  start_date.unshift((start_hour < 12 ? start_hour.toString() + ' am' : (start_hour - 12).toString() + ' pm'));
  start_date.unshift(DAYS[(new Date(date)).getDay()]);
  return start_date.join(', ');
}

return {
  determineRound: function (nowDate) {
    var start = 'Current Round: ';
    for (var i = 0; i < corsSchedule.length; i++) {
      var round = corsSchedule[i].round;
      if (nowDate < toUTC(new Date(corsSchedule[i].openBiddingStart))) {
        return 'Next Round: ' + corsSchedule[i].round + ' (Open) at ' + formatTime(corsSchedule[i].openBiddingStart);
      }
      if (nowDate >= toUTC(new Date(corsSchedule[i].openBiddingStart)) &&
        nowDate <= toUTC(new Date(corsSchedule[i].openBiddingEnd))) {
        round += ' (Open)';
        return start + round + ' till ' + formatTime(corsSchedule[i].openBiddingEnd);
      }
      if (corsSchedule[i].openBiddingStart &&
          nowDate >= toUTC(new Date(corsSchedule[i].closedBiddingStart)) &&
          nowDate <= toUTC(new Date(corsSchedule[i].closedBiddingEnd))) {
        round += ' (Closed)';
        return start + round + ' till ' + formatTime(corsSchedule[i].closedBiddingEnd);
      }
    }
  }
};
