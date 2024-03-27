import { ModRegNotificationSettings } from 'types/reducers';
import { convertModRegDates } from 'config';
import { forceTimer } from 'utils/debug';

import { getRounds } from './modreg';

jest.mock('utils/debug');

describe(getRounds, () => {
  const settings = (
    config: Partial<ModRegNotificationSettings> = {},
  ): ModRegNotificationSettings => ({
    enabled: true,
    semesterKey: '2019-2020|1',
    dismissed: [],
    scheduleType: 'Undergraduate' as const,
    ...config,
  });

  const mockTime = (now: Date | string) => {
    (forceTimer as unknown as jest.MockInstance<Date | null, []>).mockReturnValue(new Date(now));
  };

  const DEFAULT_SCHEDULE = {
    Undergraduate: convertModRegDates([
      {
        type: 'Select Courses',
        name: '1',
        start: '2019-07-25T09:00:00+08:00',
        end: '2019-07-29T12:00:00+08:00',
      },
      {
        type: 'Select Courses',
        name: '2',
        start: '2019-07-31T09:00:00+08:00',
        end: '2019-08-02T12:00:00+08:00',
      },
      {
        type: 'Submit Course Requests',
        name: '1',
        start: '2019-07-31T09:00:00+08:00',
        end: '2019-08-01T12:00:00+08:00',
      },
    ]),
    Graduate: [],
  };

  test('should return next round of each type', () => {
    // One day before select module round 2 and submit module req round 1
    mockTime('2019-07-30T09:00:00+08:00');
    expect(getRounds(settings(), DEFAULT_SCHEDULE)).toEqual([
      expect.objectContaining({
        type: 'Select Courses',
        name: '2',
      }),
      expect.objectContaining({
        type: 'Submit Course Requests',
        name: '1',
      }),
    ]);
  });

  test('should return rounds while ongoing', () => {
    // One day before select module round 1
    mockTime('2019-07-25T12:00:00+08:00');
    expect(getRounds(settings(), DEFAULT_SCHEDULE)).toEqual([
      expect.objectContaining({
        type: 'Select Courses',
        name: '1',
      }),
    ]);
  });

  test('should return rounds from of the correct type', () => {
    // There are no graduate rounds, so this should not return anything
    expect(getRounds(settings({ scheduleType: 'Graduate' }), DEFAULT_SCHEDULE)).toEqual([]);
  });

  test('should not return anything after the rounds are over', () => {
    mockTime('2019-08-03T12:00:00+08:00');
    expect(getRounds(settings(), DEFAULT_SCHEDULE)).toEqual([]);
  });

  test('should return empty array if notification is not enabled', () => {
    expect(getRounds(settings({ enabled: false }), DEFAULT_SCHEDULE)).toEqual([]);
  });

  test('should not return dismissed rounds', () => {
    mockTime('2019-07-24T09:00:00+08:00');
    expect(
      getRounds(settings({ dismissed: [{ type: 'Select Courses', name: '1' }] }), DEFAULT_SCHEDULE),
    ).toEqual([
      expect.objectContaining({
        type: 'Select Courses',
        name: '1',
        dismissed: true,
      }),
    ]);
  });
});
