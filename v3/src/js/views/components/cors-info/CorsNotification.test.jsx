// @flow
import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';

import config, { type CorsRound, type CorsPeriod, type CorsPeriodType } from 'config';
import CorsNotification from './CorsNotification';

// Save the original CORS schedule for this test and restore it afterwards
let originalSchedule;
beforeAll(() => {
  originalSchedule = config.corsSchedule;
});

afterAll(() => {
  config.corsSchedule = originalSchedule;
});

function corsPeriod(
  start: moment,
  durationInHours: number = 1,
  type: CorsPeriodType = 'open',
): CorsPeriod {
  const end = start.clone().add(durationInHours, 'hour');

  return {
    type,
    start: start.format('dddd Do MMMM, ha'),
    startDate: start.toDate(),
    end: end.format('dddd Do MMMM, ha'),
    endDate: end.toDate(),
  };
}

function setSchedule(schedule: CorsRound[]) {
  config.corsSchedule = schedule;
}

function make(now: moment = moment()) {
  return shallow(<CorsNotification time={now.toDate()} />);
}

test('should not show up if there is no CORS bidding data', () => {
  setSchedule([]);
  expect(make().type()).toBeNull();
});

test('should not show up if CORS bidding is over', () => {
  setSchedule([{
    round: '0',
    periods: [corsPeriod(moment().subtract(2, 'hour'))],
  }]);

  expect(make().type()).toBeNull();
});

test('should show next round when it has not started yet', () => {
  setSchedule([{
    round: '0',
    periods: [corsPeriod(moment().add(1, 'hour'))],
  }]);

  const content = make().text();
  expect(content).toMatch('Next');
  expect(content).toMatch('0 (Open)');
});

test('should show next round when in between the current round', () => {
  setSchedule([{
    round: '0',
    periods: [
      corsPeriod(moment().subtract(2, 'hour')),
      corsPeriod(moment().add(1, 'hour'), 1, 'closed'),
    ],
  }]);

  const content = make().text();
  expect(content).toMatch('Next');
  expect(content).toMatch('0 (Closed)');
});

test('should show current round when it is active', () => {
  setSchedule([{
    round: '0',
    periods: [corsPeriod(moment())],
  }]);

  const content = make().text();
  expect(content).toMatch('Current');
  expect(content).toMatch('0 (Open)');
});
