// @flow

import config from './index';
import academicCalendar from './academic-calendar.json';

test('Academic calendar should have start dates for the current academic year', () => {
  expect(academicCalendar[config.academicYear]).toBeDefined();
});
