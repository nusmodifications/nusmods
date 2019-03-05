import GET1025 from './fixtures/timetable/GET1025.json';
import GEK2041 from './fixtures/timetable/GEK2041.json';
import PX2108 from './fixtures/timetable/PX2108.json';

import CollateVenues, { extractVenueAvailability } from './CollateVenues';
import { EVERY_WEEK } from '../utils/test-utils';

describe(extractVenueAvailability, () => {
  test('should map lessons to venues', () => {
    expect(
      extractVenueAvailability([
        {
          ModuleCode: 'CS3216',
          ClassNo: '1',
          StartTime: '1830',
          EndTime: '2030',
          Weeks: EVERY_WEEK,
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
              Weeks: EVERY_WEEK,
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
      extractVenueAvailability([
        {
          ModuleCode: 'CS3216',
          ClassNo: '1',
          StartTime: '1830',
          EndTime: '2030',
          Weeks: EVERY_WEEK,
          Venue: '',
          DayText: 'Monday',
          LessonType: 'Lecture',
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
        ModuleCode: 'GET1025',
        SemesterData: {
          Timetable: GET1025,
        },
        Module: { ModuleTitle: 'Science Fiction and Philosophy' },
      },
      {
        ModuleCode: 'GEK2041',
        SemesterData: {
          Timetable: GEK2041,
        },
        Module: { ModuleTitle: 'Science Fiction and Philosophy' },
      },
    ];

    const task = new CollateVenues(1, '2018/2019');
    const { venues, aliases } = await task.run(data);

    expect(aliases).toEqual({
      GET1025: new Set(['GEK2041']),
      GEK2041: new Set(['GET1025']),
    });

    expect(venues).toMatchInlineSnapshot(`
Object {
  "AS2-0311": Array [
    Object {
      "Availability": Object {
        "1600": "occupied",
        "1630": "occupied",
        "1700": "occupied",
        "1730": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "E5",
          "DayText": "Tuesday",
          "EndTime": "1800",
          "LessonType": "Tutorial",
          "ModuleCode": "GET1025/​GEK2041",
          "StartTime": "1600",
          "Weeks": Array [
            2,
            4,
            6,
            8,
            10,
            12,
          ],
        },
      ],
      "Day": "Tuesday",
    },
    Object {
      "Availability": Object {
        "0800": "occupied",
        "0830": "occupied",
        "0900": "occupied",
        "0930": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "E3",
          "DayText": "Monday",
          "EndTime": "1000",
          "LessonType": "Tutorial",
          "ModuleCode": "GET1025/​GEK2041",
          "StartTime": "0800",
          "Weeks": Array [
            2,
            4,
            6,
            8,
            10,
            12,
          ],
        },
      ],
      "Day": "Monday",
    },
  ],
  "AS3-0209": Array [
    Object {
      "Availability": Object {
        "1200": "occupied",
        "1230": "occupied",
        "1300": "occupied",
        "1330": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "E4",
          "DayText": "Thursday",
          "EndTime": "1400",
          "LessonType": "Tutorial",
          "ModuleCode": "GET1025/​GEK2041",
          "StartTime": "1200",
          "Weeks": Array [
            2,
            4,
            6,
            8,
            10,
            12,
          ],
        },
      ],
      "Day": "Thursday",
    },
    Object {
      "Availability": Object {
        "1600": "occupied",
        "1630": "occupied",
        "1700": "occupied",
        "1730": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "E6",
          "DayText": "Wednesday",
          "EndTime": "1800",
          "LessonType": "Tutorial",
          "ModuleCode": "GET1025/​GEK2041",
          "StartTime": "1600",
          "Weeks": Array [
            2,
            4,
            6,
            8,
            10,
            12,
          ],
        },
      ],
      "Day": "Wednesday",
    },
    Object {
      "Availability": Object {
        "1600": "occupied",
        "1630": "occupied",
        "1700": "occupied",
        "1730": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "E2",
          "DayText": "Friday",
          "EndTime": "1800",
          "LessonType": "Tutorial",
          "ModuleCode": "GET1025/​GEK2041",
          "StartTime": "1600",
          "Weeks": Array [
            2,
            4,
            6,
            8,
            10,
            12,
          ],
        },
      ],
      "Day": "Friday",
    },
    Object {
      "Availability": Object {
        "1400": "occupied",
        "1430": "occupied",
        "1500": "occupied",
        "1530": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "E1",
          "DayText": "Monday",
          "EndTime": "1600",
          "LessonType": "Tutorial",
          "ModuleCode": "GET1025/​GEK2041",
          "StartTime": "1400",
          "Weeks": Array [
            2,
            4,
            6,
            8,
            10,
            12,
          ],
        },
      ],
      "Day": "Monday",
    },
  ],
  "LT12": Array [
    Object {
      "Availability": Object {
        "0800": "occupied",
        "0830": "occupied",
        "0900": "occupied",
        "0930": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "1",
          "DayText": "Wednesday",
          "EndTime": "1000",
          "LessonType": "Lecture",
          "ModuleCode": "GET1025/​GEK2041",
          "StartTime": "0800",
          "Weeks": Array [
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
      "Day": "Wednesday",
    },
  ],
}
`);
  });

  test('should not alias modules with itself', async () => {
    const task = new CollateVenues(1, '2018/2019');
    const input: any = {
      ModuleCode: 'PX2108',
      SemesterData: { Timetable: PX2108 },
      Module: { ModuleTitle: 'Basic Human Pathology' },
    };
    const { aliases, venues } = await task.run([input]);

    expect(venues).toMatchInlineSnapshot(`
Object {
  "LT29": Array [
    Object {
      "Availability": Object {
        "1400": "occupied",
        "1430": "occupied",
        "1500": "occupied",
        "1530": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "1",
          "DayText": "Monday",
          "EndTime": "1600",
          "LessonType": "Lecture",
          "ModuleCode": "PX2108",
          "StartTime": "1400",
          "Weeks": Array [
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
      "Day": "Monday",
    },
    Object {
      "Availability": Object {
        "1400": "occupied",
        "1430": "occupied",
        "1500": "occupied",
        "1530": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "1",
          "DayText": "Thursday",
          "EndTime": "1600",
          "LessonType": "Lecture",
          "ModuleCode": "PX2108",
          "StartTime": "1400",
          "Weeks": Array [
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
      "Day": "Thursday",
    },
  ],
  "MD1-03-01B": Array [
    Object {
      "Availability": Object {
        "1400": "occupied",
        "1430": "occupied",
        "1500": "occupied",
        "1530": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "3",
          "DayText": "Monday",
          "EndTime": "1600",
          "LessonType": "Tutorial",
          "ModuleCode": "PX2108",
          "StartTime": "1400",
          "Weeks": Array [
            9,
          ],
        },
      ],
      "Day": "Monday",
    },
  ],
  "MD1-03-01C": Array [
    Object {
      "Availability": Object {
        "1400": "occupied",
        "1430": "occupied",
        "1500": "occupied",
        "1530": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "2",
          "DayText": "Monday",
          "EndTime": "1600",
          "LessonType": "Tutorial",
          "ModuleCode": "PX2108",
          "StartTime": "1400",
          "Weeks": Array [
            9,
          ],
        },
      ],
      "Day": "Monday",
    },
  ],
  "MD11-01-03": Array [
    Object {
      "Availability": Object {
        "1400": "occupied",
        "1430": "occupied",
        "1500": "occupied",
        "1530": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "1",
          "DayText": "Monday",
          "EndTime": "1600",
          "LessonType": "Tutorial",
          "ModuleCode": "PX2108",
          "StartTime": "1400",
          "Weeks": Array [
            9,
          ],
        },
      ],
      "Day": "Monday",
    },
  ],
  "MD11CRCAUD": Array [
    Object {
      "Availability": Object {
        "1400": "occupied",
        "1430": "occupied",
        "1500": "occupied",
        "1530": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "1",
          "DayText": "Thursday",
          "EndTime": "1600",
          "LessonType": "Tutorial",
          "ModuleCode": "PX2108",
          "StartTime": "1400",
          "Weeks": Array [
            3,
            6,
            13,
          ],
        },
        Object {
          "ClassNo": "2",
          "DayText": "Thursday",
          "EndTime": "1600",
          "LessonType": "Tutorial",
          "ModuleCode": "PX2108",
          "StartTime": "1400",
          "Weeks": Array [
            3,
            6,
            13,
          ],
        },
        Object {
          "ClassNo": "3",
          "DayText": "Thursday",
          "EndTime": "1600",
          "LessonType": "Tutorial",
          "ModuleCode": "PX2108",
          "StartTime": "1400",
          "Weeks": Array [
            3,
            6,
            13,
          ],
        },
      ],
      "Day": "Thursday",
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
        ModuleCode: 'EL5251',
        SemesterData: {
          Timetable: [
            {
              ClassNo: '1',
              StartTime: '1800',
              EndTime: '2100',
              Weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              Venue: 'AS3-0306',
              DayText: 'Friday',
              LessonType: 'Seminar-Style Module Class',
            },
          ],
        },
        Module: { ModuleTitle: 'Approaches to Discourse' },
      },
      {
        ModuleCode: 'EL6884',
        SemesterData: {
          Timetable: [
            {
              ClassNo: '1',
              StartTime: '1800',
              EndTime: '2100',
              Weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              Venue: 'AS3-0306',
              DayText: 'Friday',
              LessonType: 'Seminar-Style Module Class',
            },
          ],
        },
        Module: { ModuleTitle: 'Topics in Applied Linguistics' },
      },
    ];

    const { aliases, venues } = await task.run(input);
    expect(venues).toMatchInlineSnapshot(`
Object {
  "AS3-0306": Array [
    Object {
      "Availability": Object {
        "1800": "occupied",
        "1830": "occupied",
        "1900": "occupied",
        "1930": "occupied",
        "2000": "occupied",
        "2030": "occupied",
      },
      "Classes": Array [
        Object {
          "ClassNo": "1",
          "DayText": "Friday",
          "EndTime": "2100",
          "LessonType": "Seminar-Style Module Class",
          "ModuleCode": "EL5251/​EL6884",
          "StartTime": "1800",
          "Weeks": Array [
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
      "Day": "Friday",
    },
  ],
}
`);

    expect(aliases).toEqual({});
  });
});
