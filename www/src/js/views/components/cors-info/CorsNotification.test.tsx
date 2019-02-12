import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import moment, { Moment } from 'moment';

import config, { CorsRound, CorsPeriod, CorsPeriodType } from 'config';
import createHistory from 'test-utils/createHistory';
import { CorsNotificationComponent } from './CorsNotification';

describe(CorsNotificationComponent, () => {
  // Save the original CORS schedule for this test and restore it afterwards
  let originalSchedule: typeof config.corsSchedule;
  beforeAll(() => {
    originalSchedule = config.corsSchedule;
  });

  afterAll(() => {
    config.corsSchedule = originalSchedule;
  });

  function corsPeriod(
    start: Moment,
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

  function make(dismissedRounds: string[] = [], enabled: boolean = true) {
    const dismissCorsNotification = jest.fn();
    const openNotification = jest.fn();

    return {
      dismissCorsNotification,
      openNotification,

      wrapper: mount(
        <CorsNotificationComponent
          enabled={enabled}
          dismissedRounds={dismissedRounds}
          dismissCorsNotification={dismissCorsNotification}
          openNotification={openNotification}
          {...createHistory()}
        />,
      ),
    };
  }

  function expectEmpty(container: { wrapper: ReactWrapper }) {
    expect(container.wrapper.html()).toBeNull();
  }

  test('should not show up if there is no CORS bidding data', () => {
    setSchedule([]);

    expectEmpty(make());
  });

  test('should not show up if CORS bidding is over', () => {
    setSchedule([
      {
        round: '0',
        periods: [corsPeriod(moment().subtract(2, 'hour'))],
      },
    ]);

    expectEmpty(make());
  });

  test('should not show up if CORS notification is not enabled', () => {
    setSchedule([
      {
        round: '0',
        periods: [corsPeriod(moment().add(1, 'hour'))],
      },
    ]);

    expectEmpty(make([], false));
  });

  test('should not show up if it has been dismissed', () => {
    setSchedule([
      {
        round: '0',
        periods: [corsPeriod(moment().add(1, 'hour'))],
      },
    ]);

    expectEmpty(make(['0'], false));
  });

  test('should show next round when it has not started yet', () => {
    setSchedule([
      {
        round: '0',
        periods: [corsPeriod(moment().add(1, 'hour'))],
      },
    ]);

    const content = make(['1']).wrapper.text();
    expect(content).toMatch('Next');
    expect(content).toMatch('0 (Open)');
  });

  test('should show next round when in between the current round', () => {
    setSchedule([
      {
        round: '0',
        periods: [
          corsPeriod(moment().subtract(2, 'hour')),
          corsPeriod(moment().add(1, 'hour'), 1, 'closed'),
        ],
      },
    ]);

    const content = make(['1']).wrapper.text();
    expect(content).toMatch('Next');
    expect(content).toMatch('0 (Closed)');
  });

  test('should show current round when it is active', () => {
    setSchedule([
      {
        round: '0',
        periods: [corsPeriod(moment().subtract(1, 'minute'))],
      },
    ]);

    const content = make(['1']).wrapper.text();
    expect(content).toMatch('Current');
    expect(content).toMatch('0 (Open)');
  });
});
