import GET1025 from './fixtures/nusmods-timetable/GET1025.json';
import GEK2041 from './fixtures/nusmods-timetable/GEK2041.json';
import PX2108 from './fixtures/nusmods-timetable/PX2108.json';

import CollateVenues, { extractVenueAvailability } from './CollateVenues';
import { EVERY_WEEK } from '../utils/test-utils';

jest.mock('../services/io/elastic');

describe(extractVenueAvailability, () => {
  test('should map lessons to venues', () => {
    const expected: ReturnType<typeof extractVenueAvailability>[string][number] = {
      day: 'Monday',
      classes: [
        {
          moduleCode: 'CS3216',
          classNo: '1',
          startTime: '1830',
          endTime: '2030',
          weeks: EVERY_WEEK,
          day: 'Monday',
          lessonType: 'Lecture',
          size: 30,
        },
      ],
      availability: {
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
    };

    expect(
      extractVenueAvailability([
        {
          moduleCode: 'CS3216',
          classNo: '1',
          startTime: '1830',
          endTime: '2030',
          weeks: EVERY_WEEK,
          venue: 'COM1-VCRM',
          day: 'Monday',
          lessonType: 'Lecture',
          size: 30,
          covidZone: 'A',
        },
      ]),
    ).toEqual({
      'COM1-VCRM': [expected],
    });
  });

  test('should not map lessons that have no venue', () => {
    expect(
      extractVenueAvailability([
        {
          moduleCode: 'CS3216',
          classNo: '1',
          startTime: '1830',
          endTime: '2030',
          weeks: EVERY_WEEK,
          venue: '',
          day: 'Monday',
          lessonType: 'Lecture',
          size: 30,
          covidZone: 'Unknown',
        },
      ]),
    ).toEqual({});
  });
});
/* eslint-disable no-irregular-whitespace */

describe(CollateVenues, () => {
  test('should merge dual coded modules', async () => {
    const data: any = [
      {
        moduleCode: 'GET1025',
        semesterData: {
          timetable: GET1025,
        },
        module: { title: 'Science Fiction and Philosophy' },
      },
      {
        moduleCode: 'GEK2041',
        semesterData: {
          timetable: GEK2041,
        },
        module: { title: 'Science Fiction and Philosophy' },
      },
    ];

    const task = new CollateVenues(1, '2018/2019');
    const { venues, aliases } = await task.run(data);

    expect(aliases).toEqual({
      GET1025: new Set(['GEK2041']),
      GEK2041: new Set(['GET1025']),
    });

    expect(venues).toMatchInlineSnapshot(`
      {
        "AS2-0311": [
          {
            "availability": {
              "1600": "occupied",
              "1630": "occupied",
              "1700": "occupied",
              "1730": "occupied",
            },
            "classes": [
              {
                "classNo": "E5",
                "day": "Tuesday",
                "endTime": "1800",
                "lessonType": "Tutorial",
                "moduleCode": "GET1025/​GEK2041",
                "startTime": "1600",
                "weeks": [
                  2,
                  4,
                  6,
                  8,
                  10,
                  12,
                ],
              },
            ],
            "day": "Tuesday",
          },
          {
            "availability": {
              "0800": "occupied",
              "0830": "occupied",
              "0900": "occupied",
              "0930": "occupied",
            },
            "classes": [
              {
                "classNo": "E3",
                "day": "Monday",
                "endTime": "1000",
                "lessonType": "Tutorial",
                "moduleCode": "GET1025/​GEK2041",
                "startTime": "0800",
                "weeks": [
                  2,
                  4,
                  6,
                  8,
                  10,
                  12,
                ],
              },
            ],
            "day": "Monday",
          },
        ],
        "AS3-0209": [
          {
            "availability": {
              "1200": "occupied",
              "1230": "occupied",
              "1300": "occupied",
              "1330": "occupied",
            },
            "classes": [
              {
                "classNo": "E4",
                "day": "Thursday",
                "endTime": "1400",
                "lessonType": "Tutorial",
                "moduleCode": "GET1025/​GEK2041",
                "startTime": "1200",
                "weeks": [
                  2,
                  4,
                  6,
                  8,
                  10,
                  12,
                ],
              },
            ],
            "day": "Thursday",
          },
          {
            "availability": {
              "1600": "occupied",
              "1630": "occupied",
              "1700": "occupied",
              "1730": "occupied",
            },
            "classes": [
              {
                "classNo": "E6",
                "day": "Wednesday",
                "endTime": "1800",
                "lessonType": "Tutorial",
                "moduleCode": "GET1025/​GEK2041",
                "startTime": "1600",
                "weeks": [
                  2,
                  4,
                  6,
                  8,
                  10,
                  12,
                ],
              },
            ],
            "day": "Wednesday",
          },
          {
            "availability": {
              "1600": "occupied",
              "1630": "occupied",
              "1700": "occupied",
              "1730": "occupied",
            },
            "classes": [
              {
                "classNo": "E2",
                "day": "Friday",
                "endTime": "1800",
                "lessonType": "Tutorial",
                "moduleCode": "GET1025/​GEK2041",
                "startTime": "1600",
                "weeks": [
                  2,
                  4,
                  6,
                  8,
                  10,
                  12,
                ],
              },
            ],
            "day": "Friday",
          },
          {
            "availability": {
              "1400": "occupied",
              "1430": "occupied",
              "1500": "occupied",
              "1530": "occupied",
            },
            "classes": [
              {
                "classNo": "E1",
                "day": "Monday",
                "endTime": "1600",
                "lessonType": "Tutorial",
                "moduleCode": "GET1025/​GEK2041",
                "startTime": "1400",
                "weeks": [
                  2,
                  4,
                  6,
                  8,
                  10,
                  12,
                ],
              },
            ],
            "day": "Monday",
          },
        ],
        "LT12": [
          {
            "availability": {
              "0800": "occupied",
              "0830": "occupied",
              "0900": "occupied",
              "0930": "occupied",
            },
            "classes": [
              {
                "classNo": "1",
                "day": "Wednesday",
                "endTime": "1000",
                "lessonType": "Lecture",
                "moduleCode": "GET1025/​GEK2041",
                "startTime": "0800",
                "weeks": [
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                  13,
                ],
              },
            ],
            "day": "Wednesday",
          },
        ],
      }
    `);
  });

  test('should not alias modules with itself', async () => {
    const task = new CollateVenues(1, '2018/2019');
    const input: any = {
      moduleCode: 'PX2108',
      semesterData: { timetable: PX2108 },
      module: { title: 'Basic Human Pathology' },
    };
    const { aliases, venues } = await task.run([input]);

    expect(venues).toMatchInlineSnapshot(`
      {
        "LT29": [
          {
            "availability": {
              "1400": "occupied",
              "1430": "occupied",
              "1500": "occupied",
              "1530": "occupied",
            },
            "classes": [
              {
                "classNo": "1",
                "day": "Monday",
                "endTime": "1600",
                "lessonType": "Lecture",
                "moduleCode": "PX2108",
                "startTime": "1400",
                "weeks": [
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  10,
                  11,
                  12,
                  13,
                ],
              },
            ],
            "day": "Monday",
          },
          {
            "availability": {
              "1400": "occupied",
              "1430": "occupied",
              "1500": "occupied",
              "1530": "occupied",
            },
            "classes": [
              {
                "classNo": "1",
                "day": "Thursday",
                "endTime": "1600",
                "lessonType": "Lecture",
                "moduleCode": "PX2108",
                "startTime": "1400",
                "weeks": [
                  1,
                  2,
                  4,
                  5,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                ],
              },
            ],
            "day": "Thursday",
          },
        ],
        "MD1-03-01B": [
          {
            "availability": {
              "1400": "occupied",
              "1430": "occupied",
              "1500": "occupied",
              "1530": "occupied",
            },
            "classes": [
              {
                "classNo": "3",
                "day": "Monday",
                "endTime": "1600",
                "lessonType": "Tutorial",
                "moduleCode": "PX2108",
                "startTime": "1400",
                "weeks": [
                  9,
                ],
              },
            ],
            "day": "Monday",
          },
        ],
        "MD1-03-01C": [
          {
            "availability": {
              "1400": "occupied",
              "1430": "occupied",
              "1500": "occupied",
              "1530": "occupied",
            },
            "classes": [
              {
                "classNo": "2",
                "day": "Monday",
                "endTime": "1600",
                "lessonType": "Tutorial",
                "moduleCode": "PX2108",
                "startTime": "1400",
                "weeks": [
                  9,
                ],
              },
            ],
            "day": "Monday",
          },
        ],
        "MD11-01-03": [
          {
            "availability": {
              "1400": "occupied",
              "1430": "occupied",
              "1500": "occupied",
              "1530": "occupied",
            },
            "classes": [
              {
                "classNo": "1",
                "day": "Monday",
                "endTime": "1600",
                "lessonType": "Tutorial",
                "moduleCode": "PX2108",
                "startTime": "1400",
                "weeks": [
                  9,
                ],
              },
            ],
            "day": "Monday",
          },
        ],
        "MD11CRCAUD": [
          {
            "availability": {
              "1400": "occupied",
              "1430": "occupied",
              "1500": "occupied",
              "1530": "occupied",
            },
            "classes": [
              {
                "classNo": "1",
                "day": "Thursday",
                "endTime": "1600",
                "lessonType": "Tutorial",
                "moduleCode": "PX2108",
                "startTime": "1400",
                "weeks": [
                  3,
                  6,
                  13,
                ],
              },
              {
                "classNo": "2",
                "day": "Thursday",
                "endTime": "1600",
                "lessonType": "Tutorial",
                "moduleCode": "PX2108",
                "startTime": "1400",
                "weeks": [
                  3,
                  6,
                  13,
                ],
              },
              {
                "classNo": "3",
                "day": "Thursday",
                "endTime": "1600",
                "lessonType": "Tutorial",
                "moduleCode": "PX2108",
                "startTime": "1400",
                "weeks": [
                  3,
                  6,
                  13,
                ],
              },
            ],
            "day": "Thursday",
          },
        ],
      }
    `);
    expect(aliases).toEqual({});
  });

  test('should not alias module with different names', async () => {
    const task = new CollateVenues(1, '2018/2019');
    const input: any = [
      {
        moduleCode: 'EL5251',
        semesterData: {
          timetable: [
            {
              classNo: '1',
              startTime: '1800',
              endTime: '2100',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              venue: 'AS3-0306',
              day: 'Friday',
              lessonType: 'Seminar-Style Module Class',
            },
          ],
        },
        module: { title: 'Approaches to Discourse' },
      },
      {
        moduleCode: 'EL6884',
        semesterData: {
          timetable: [
            {
              classNo: '1',
              startTime: '1800',
              endTime: '2100',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              venue: 'AS3-0306',
              day: 'Friday',
              lessonType: 'Seminar-Style Module Class',
            },
          ],
        },
        module: { title: 'Topics in Applied Linguistics' },
      },
    ];

    const { aliases, venues } = await task.run(input);
    expect(venues).toMatchInlineSnapshot(`
      {
        "AS3-0306": [
          {
            "availability": {
              "1800": "occupied",
              "1830": "occupied",
              "1900": "occupied",
              "1930": "occupied",
              "2000": "occupied",
              "2030": "occupied",
            },
            "classes": [
              {
                "classNo": "1",
                "day": "Friday",
                "endTime": "2100",
                "lessonType": "Seminar-Style Module Class",
                "moduleCode": "EL5251/​EL6884",
                "startTime": "1800",
                "weeks": [
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                  13,
                ],
              },
            ],
            "day": "Friday",
          },
        ],
      }
    `);

    expect(aliases).toEqual({});
  });
});
