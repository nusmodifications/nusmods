'use strict';

var corsSchedule = require('./corsSchedule1516Sem2.json');

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
  var startDate = date.split(', ').slice(0, 2);
  var startHour = (new Date(date)).getHours();
  startDate.unshift((startHour < 12 ? startHour.toString() + ' am' : (startHour - 12).toString() + ' pm'));
  startDate.unshift(DAYS[(new Date(date)).getDay()]);
  return startDate.join(', ');
}

module.exports = {
  determineRound: function (nowDate) {
    // TODO: Write a CORS Marionette view to separate HTML from CORS Logic
    var start = 'Current CORS Round: <strong>';
    for (var i = 0; i < corsSchedule.length; i++) {
      var round = corsSchedule[i].round;
      if (nowDate < toUTC(new Date(corsSchedule[i].openBiddingStart))) {
        var text = 'Next CORS Round: <strong>' + corsSchedule[i].round;
        return text + ' (Open)</strong> at<br><strong>' + formatTime(corsSchedule[i].openBiddingStart) + '</strong>';
      }
      if (nowDate >= toUTC(new Date(corsSchedule[i].openBiddingStart)) &&
        nowDate <= toUTC(new Date(corsSchedule[i].openBiddingEnd))) {
        round += ' (Open)</strong>';
        return start + round + ' till<br><strong>' + formatTime(corsSchedule[i].openBiddingEnd) + '</strong>';
      }
      if (corsSchedule[i].openBiddingStart &&
          nowDate >= toUTC(new Date(corsSchedule[i].closedBiddingStart)) &&
          nowDate <= toUTC(new Date(corsSchedule[i].closedBiddingEnd))) {
        round += ' (Closed)</strong>';
        return start + round + ' till<br><strong>' + formatTime(corsSchedule[i].closedBiddingEnd) + '</strong>';
      }
    }
  }
};
