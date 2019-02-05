// @flow

import { extractVenueAvailability } from './CollateVenues';

describe(extractVenueAvailability, () => {
  test('should map lessons to venues', () => {
    expect(
      extractVenueAvailability('CS3216', [
        {
          ClassNo: '1',
          StartTime: '1830',
          EndTime: '2030',
          Weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          Venue: 'COM1-VCRM',
          DayText: 'Monday',
          LessonType: 'Lecture',
        },
      ]),
    ).toEqual({
      'COM1-VCRM': [
        {
          Day: 'Monday',
          Classes: [
            {
              ModuleCode: 'CS3216',
              ClassNo: '1',
              StartTime: '1830',
              EndTime: '2030',
              Weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              DayText: 'Monday',
              LessonType: 'Lecture',
            },
          ],
          Availability: {
            // '1000': 'vacant',
            // '1030': 'vacant',
            // '1100': 'vacant',
            // '1130': 'vacant',
            // '1200': 'vacant',
            // '1230': 'vacant',
            // '1300': 'vacant',
            // '1330': 'vacant',
            // '1400': 'vacant',
            // '1430': 'vacant',
            // '1500': 'vacant',
            // '1530': 'vacant',
            // '1600': 'vacant',
            // '1630': 'vacant',
            // '1700': 'vacant',
            // '1730': 'vacant',
            // '1800': 'vacant',
            '1830': 'occupied',
            '1900': 'occupied',
            '1930': 'occupied',
            '2000': 'occupied',
            // '2030': 'vacant',
            // '2100': 'vacant',
            // '2130': 'vacant',
            // '2200': 'vacant',
            // '2230': 'vacant',
            // '2300': 'vacant',
            // '2330': 'vacant',
            // '0600': 'vacant',
            // '0630': 'vacant',
            // '0700': 'vacant',
            // '0730': 'vacant',
            // '0800': 'vacant',
            // '0830': 'vacant',
            // '0900': 'vacant',
            // '0930': 'vacant',
          },
        },
      ],
    });
  });

  test('should not map lessons that have no venue', () => {
    expect(
      extractVenueAvailability('CS3216', [
        {
          ClassNo: '1',
          StartTime: '1830',
          EndTime: '2030',
          Weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          Venue: '',
          DayText: 'Monday',
          LessonType: 'Lecture',
        },
      ]),
    ).toEqual({});
  });
});
