import * as React from 'react';
import { flatten, size } from 'lodash';
import { shallow } from 'enzyme';

import * as weather from 'apis/weather';
import { waitFor } from 'test-utils/async';
import { EVEN_WEEK, EVERY_WEEK } from 'test-utils/timetable';
import { captureException } from 'utils/error';

import { Props, DaySection, TodayContainerComponent, mapStateToProps } from './TodayContainer';
import forecasts from './__mocks__/forecasts.json';
import DayEvents from '../DayEvents';
import styles from '../DayEvents.scss';

/* eslint-disable no-useless-computed-key */

const mockWeather = weather as jest.Mocked<typeof weather>;
const mockCaptureException = captureException as jest.Mock;

const COLORS = {
  CS3216: 1,
  CS1010S: 2,
  PC1222: 3,
};

const CS3216_LESSONS = {
  Lecture: [
    {
      moduleCode: 'CS3216',
      title: 'Software Product Engineering for Digital Markets',
      classNo: '1',
      lessonType: 'Lecture',
      weeks: EVERY_WEEK,
      day: 'Monday',
      startTime: '1830',
      endTime: '2030',
      venue: 'VCRm',
    },
  ],
};

const CS1010S_LESSONS = {
  Recitation: [
    {
      moduleCode: 'CS1010S',
      title: 'Programming Methodology',
      classNo: '9',
      lessonType: 'Recitation',
      weeks: EVERY_WEEK,
      day: 'Thursday',
      startTime: '1100',
      endTime: '1200',
      venue: 'i3-0344',
    },
  ],
};

const PC1222_LESSONS = {
  Laboratory: [
    {
      moduleCode: 'PC1222',
      title: 'Fundamentals of Physics II',
      classNo: 'U02',
      lessonType: 'Laboratory',
      weeks: EVEN_WEEK,
      day: 'Tuesday',
      startTime: '1400',
      endTime: '1700',
      venue: 'S12-0402',
    },
  ],
  Tutorial: [
    {
      moduleCode: 'PC1222',
      title: 'Fundamentals of Physics II',
      classNo: 'T11',
      lessonType: 'Tutorial',
      weeks: EVERY_WEEK,
      day: 'Wednesday',
      startTime: '0900',
      endTime: '1000',
      venue: 'CQT/SR0315',
    },
  ],
  Lecture: [
    {
      moduleCode: 'PC1222',
      title: 'Fundamentals of Physics II',
      classNo: 'SL1',
      lessonType: 'Lecture',
      weeks: EVERY_WEEK,
      day: 'Tuesday',
      startTime: '1200',
      endTime: '1400',
      venue: 'LT25',
    },
    {
      moduleCode: 'PC1222',
      title: 'Fundamentals of Physics II',
      classNo: 'SL1',
      lessonType: 'Lecture',
      weeks: EVERY_WEEK,
      day: 'Friday',
      startTime: '1200',
      endTime: '1400',
      venue: 'LT25',
    },
  ],
};

const LESSONS = {
  CS3216: CS3216_LESSONS,
  CS1010S: CS1010S_LESSONS,
  PC1222: PC1222_LESSONS,
};

jest.mock('apis/weather');
jest.mock('utils/error');

//     August 2016            September 2016         October 2016
// Wk Mo Tu We Th Fr Sa | Wk Mo Tu We Th Fr Sa | Wk Mo Tu We Th Fr Sa
//     2  3  4  5  6    | 04        1  2  3    | 07                 1
// 01  8  9 10 11 12 13 | 05  5  6  7  8  9 10 | 08  3  4  5  6  7  8
// 02 15 16 17 18 19 20 | 06 12 13 14 15 16 17 | 09 10 11 12 13 14 15
// 03 22 23 24 25 26 27 | Re 19 20 21 22 23 24 | 10 17 18 19 20 21 22
// 04 29 30 31          | 07 26 27 28 29 30    | 11 24 25 26 27 28 29
//                      |                      | 12 31
//
//     November 2016    |
// Wk Mo Tu We Th Fr Sa |
// 12     1  2  3  4  5 |
// 13  7  8  9 10 11 12 |
// Re 14 15 16 17 18 19 |
// E1 21 22 23 24 25 26 |
// E2 28 29 30          |
describe(TodayContainerComponent, () => {
  const make = (props: Partial<Props> & { currentTime: Date }) => {
    const componentProps: Props = {
      colors: COLORS,
      matchBreakpoint: false,
      timetableWithLessons: LESSONS,

      ...props,
    };

    return shallow(<TodayContainerComponent {...componentProps} />);
  };

  const getLessons = (wrapper: ReturnType<typeof make>) => {
    const days = wrapper.find(DaySection).find(DayEvents);
    const cards = days.map((w) => w.shallow().find(`.${styles.card}`));
    const titles = cards.map((c) =>
      c.map((ele) => {
        const code = ele
          .find('h4')
          .text()
          .split(' ')[0];

        const lesson = ele
          .find('p')
          .first()
          .text();

        return `${code} ${lesson}`;
      }),
    );

    return flatten(titles);
  };

  test('should render', () => {
    // Monday, 8th August 2016, 0800 - week 1
    const now = new Date('2016-08-08T08:00:00+08:00');

    const wrapper = make({
      currentTime: now,
      timetableWithLessons: {},
    });

    expect(getLessons(wrapper)).toHaveLength(0);
  });

  test('should render lessons on a normal week', () => {
    // Monday, 29th August 2016, 0800 - week 4
    const now = new Date('2016-08-29T08:00:00+08:00');
    const wrapper = make({ currentTime: now });

    expect(getLessons(wrapper)).toEqual([
      'CS3216 Lecture 1',
      'PC1222 Lecture SL1',
      'PC1222 Laboratory U02',
      'PC1222 Tutorial T11',
      'CS1010S Recitation 9',
      'PC1222 Lecture SL1',
    ]);
  });

  test('should not render even week lessons on odd weeks', () => {
    // Monday, 22th August 2016, 0800 - week 3
    const now = new Date('2016-08-22T08:00:00+08:00');
    const wrapper = make({ currentTime: now });

    expect(getLessons(wrapper)).toEqual([
      'CS3216 Lecture 1',
      'PC1222 Lecture SL1',
      'PC1222 Tutorial T11',
      'CS1010S Recitation 9',
      'PC1222 Lecture SL1',
    ]);
  });

  test('should capture exception when weather API fails to load', async () => {
    mockWeather.fourDay.mockRejectedValueOnce(new Error('Cannot load weather'));

    const now = new Date('2016-08-22T18:00:00+08:00');
    make({ currentTime: now });

    expect(mockWeather.twoHour).toBeCalled();
    expect(mockWeather.tomorrow).toBeCalled();
    expect(mockWeather.fourDay).toBeCalled();

    await waitFor(() => mockCaptureException.mock.calls.length > 0);

    expect(mockCaptureException).toBeCalled();
  });

  test('should show icons for the next four days', async () => {
    mockWeather.twoHour.mockResolvedValue('Cloudy');
    mockWeather.tomorrow.mockResolvedValue('Fair (Day)');
    mockWeather.fourDay.mockResolvedValue(forecasts);

    const now = new Date('2019-02-07T08:00:00+08:00');
    const wrapper = make({ currentTime: now });

    await waitFor(() => size(wrapper.state('weather')) > 3);
    expect(wrapper.state('weather')).toEqual({
      '0': 'Cloudy',
      '1': 'Fair (Day)',
      '2': 'Afternoon thundery showers.',
      '3': 'Fair.',
    });
  });

  test('should work when tomorrow return null', async () => {
    mockWeather.twoHour.mockResolvedValue('Cloudy');
    mockWeather.tomorrow.mockResolvedValue(null);
    mockWeather.fourDay.mockResolvedValue(forecasts);

    const now = new Date('2019-02-07T08:00:00+08:00');
    const wrapper = make({ currentTime: now });

    await waitFor(() => size(wrapper.state('weather')) > 3);
    expect(wrapper.state('weather')).toEqual({
      '0': 'Cloudy',
      '1': 'Late afternoon thundery showers.',
      '2': 'Afternoon thundery showers.',
      '3': 'Fair.',
    });
  });
});

describe(mapStateToProps, () => {
  test('should use correct semester', () => {
    // On week -1 of sem 2 the semester should be 2, not 1
    const ownProps: any = {
      // Week -1 of sem 2 of AY2018/2019
      currentTime: new Date('2019-01-09T00:00:00.000Z'),
    };

    const state: any = {
      moduleBank: { modules: {} },
      timetables: {
        lessons: {
          [1]: {
            CS3216: {},
          },
          [2]: {
            CS1010S: {},
          },
        },
        colors: {
          [1]: COLORS,
          [2]: COLORS,
        },
      },
    };

    // Should return sem 2 timetable, not sem 1
    expect(mapStateToProps(state, ownProps).timetableWithLessons).toHaveProperty('CS1010S');
  });
});
