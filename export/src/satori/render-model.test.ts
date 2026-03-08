import { describe, expect, test } from 'vitest';

import type { ExportData, Module } from '../types';
import { buildRenderableTimetable } from './render-model';
import { renderSatoriImage } from './render-satori';

const fixtureModules: Module[] = [
  {
    moduleCode: 'CS1010',
    moduleCredit: '4',
    semesterData: [
      {
        examDate: '2026-05-01T01:00:00.000Z',
        examDuration: 120,
        semester: 1,
        timetable: [
          {
            classNo: '01',
            day: 'Monday',
            endTime: '1200',
            lessonType: 'Lecture',
            startTime: '1000',
            venue: 'LT19',
            weeks: [1, 2, 3],
          },
          {
            classNo: '02',
            day: 'Tuesday',
            endTime: '1300',
            lessonType: 'Tutorial',
            startTime: '1200',
            venue: 'COM1-0208',
            weeks: [1, 2, 3],
          },
        ],
      },
    ],
    title: 'Programming Methodology',
  },
  {
    moduleCode: 'MA1101R',
    moduleCredit: '4',
    semesterData: [
      {
        examDate: '2026-05-03T01:00:00.000Z',
        examDuration: 90,
        semester: 1,
        timetable: [
          {
            classNo: '01',
            day: 'Monday',
            endTime: '1300',
            lessonType: 'Lecture',
            startTime: '1100',
            venue: 'LT27',
            weeks: [1, 2, 3],
          },
        ],
      },
    ],
    title: 'Linear Algebra I',
  },
  {
    moduleCode: 'EG1311',
    moduleCredit: '4',
    semesterData: [
      {
        examDate: '2026-05-05T01:00:00.000Z',
        semester: 1,
        timetable: [
          {
            classNo: '01',
            day: 'Saturday',
            endTime: '1200',
            lessonType: 'Laboratory',
            startTime: '1000',
            venue: 'E-Learn_A',
            weeks: [1, 2, 3],
          },
        ],
      },
    ],
    title: 'Engineering Principles',
  },
];

function makeExportData(overrides: Partial<ExportData> = {}): ExportData {
  return {
    colors: {},
    hidden: ['EG1311'],
    semester: 1,
    settings: {
      colorScheme: 'LIGHT_COLOR_SCHEME',
    },
    ta: ['MA1101R'],
    theme: {
      id: 'eighties',
      showTitle: false,
      timetableOrientation: 'HORIZONTAL',
    },
    timetable: {
      CS1010: { Lecture: [0], Tutorial: [1] },
      EG1311: { Laboratory: [0] },
      MA1101R: { Lecture: [0] },
    },
    ...overrides,
  };
}

test('buildRenderableTimetable excludes hidden lessons and keeps overlapping rows separate', () => {
  const model = buildRenderableTimetable(makeExportData(), fixtureModules);
  const monday = model.days.find((day) => day.day === 'Monday');

  expect(monday).toBeDefined();
  expect(monday!.rows.length).toBe(2);
  expect(model.days.some((day) => day.day === 'Saturday')).toBe(false);
  expect(model.activeUnits).toBe(4);
  expect(model.totalUnits).toBe(12);
  expect(monday!.rows[0]?.[0]?.weekText).toBe('Weeks 1, 2, 3');
  expect(model.moduleCards.find((module) => module.moduleCode === 'MA1101R')?.isTa).toBe(true);
  expect(model.moduleCards.find((module) => module.moduleCode === 'EG1311')?.isHidden).toBe(true);
});

test('buildRenderableTimetable includes saturday when a visible lesson is scheduled there', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      hidden: [],
      ta: [],
      timetable: {
        EG1311: { Laboratory: [0] },
      },
    }),
    fixtureModules,
  );

  expect(model.days.some((day) => day.day === 'Saturday')).toBe(true);
});

test('buildRenderableTimetable handles Saturday classes', () => {
  const ind5005a: Module = {
    moduleCode: 'IND5005A',
    moduleCredit: '0',
    semesterData: [
      {
        semester: 1,
        timetable: [
          {
            classNo: '1',
            day: 'Tuesday',
            endTime: '1400',
            lessonType: 'Lecture',
            startTime: '1200',
            venue: '',
            weeks: [2, 4, 6],
          },
          {
            classNo: '1',
            day: 'Saturday',
            endTime: '1300',
            lessonType: 'Lecture',
            startTime: '0900',
            venue: '',
            weeks: [9, 10],
          },
        ],
      },
    ],
    title: 'Professional Career Development',
  };

  const model = buildRenderableTimetable(
    {
      colors: { IND5005A: 3 },
      hidden: [],
      semester: 1,
      settings: { colorScheme: 'LIGHT_COLOR_SCHEME' },
      ta: [],
      theme: {
        id: 'eighties',
        showTitle: false,
        timetableOrientation: 'HORIZONTAL',
      },
      timetable: { IND5005A: { Lecture: [0, 1] } },
    },
    [ind5005a],
  );

  expect(model.days.map((d) => d.day)).toContain('Saturday');
  expect(model.days.map((d) => d.day)).not.toContain('Sunday');

  const saturday = model.days.find((d) => d.day === 'Saturday')!;
  expect(saturday.rows[0]?.length).toBe(1);
  expect(saturday.rows[0]?.[0]?.weekText).toBe('Weeks 9, 10');
  expect(saturday.rows[0]?.[0]?.moduleCode).toBe('IND5005A');

  const tuesday = model.days.find((d) => d.day === 'Tuesday')!;
  expect(tuesday.rows[0]?.[0]?.weekText).toBe('Weeks 2, 4, 6');

  expect(model.startingIndex).toBe(9 * 4);
  expect(model.timeLabels[0]?.label).toBe('0900');

  const card = model.moduleCards.find((m) => m.moduleCode === 'IND5005A')!;
  expect(card.moduleCredit).toBe(0);
  expect(card.metaLine).toContain('No Exam');
  expect(card.metaLine).toContain('0 Units');
  expect(model.totalUnits).toBe(0);
  expect(model.activeUnits).toBe(0);
});

test('buildRenderableTimetable sorts modules without exams before dated exams', () => {
  const modules = fixtureModules.map((module) =>
    module.moduleCode === 'EG1311'
      ? {
          ...module,
          semesterData: [{ ...module.semesterData[0], examDate: undefined }],
        }
      : module,
  );
  const model = buildRenderableTimetable(makeExportData({ hidden: [] }), modules);

  expect(model.moduleCards.map((module) => module.moduleCode)).toEqual([
    'EG1311',
    'CS1010',
    'MA1101R',
  ]);
});

test('buildRenderableTimetable sets isVertical based on orientation', () => {
  const horizontal = buildRenderableTimetable(makeExportData(), fixtureModules);
  expect(horizontal.isVertical).toBe(false);

  const vertical = buildRenderableTimetable(
    makeExportData({
      theme: {
        id: 'eighties',
        showTitle: false,
        timetableOrientation: 'VERTICAL',
      },
    }),
    fixtureModules,
  );
  expect(vertical.isVertical).toBe(true);
});

test('buildRenderableTimetable uses dark color scheme', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      settings: { colorScheme: 'DARK_COLOR_SCHEME' },
      theme: {
        id: 'monokai',
        showTitle: true,
        timetableOrientation: 'HORIZONTAL',
      },
    }),
    fixtureModules,
  );

  expect(model.colorScheme).toBe('DARK_COLOR_SCHEME');
  expect(model.themeId).toBe('monokai');
});

test('buildRenderableTimetable includes module title when showTitle is true and horizontal', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      hidden: [],
      ta: [],
      theme: {
        id: 'eighties',
        showTitle: true,
        timetableOrientation: 'HORIZONTAL',
      },
      timetable: { CS1010: { Lecture: [0] } },
    }),
    fixtureModules,
  );

  expect(model.showTitle).toBe(true);
  const monday = model.days.find((d) => d.day === 'Monday');
  expect(monday!.rows[0]?.[0]?.displayTitle).toBe('CS1010 Programming Methodology');
});

test('buildRenderableTimetable suppresses showTitle when vertical', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      hidden: [],
      ta: [],
      theme: {
        id: 'eighties',
        showTitle: true,
        timetableOrientation: 'VERTICAL',
      },
      timetable: { CS1010: { Lecture: [0] } },
    }),
    fixtureModules,
  );

  expect(model.showTitle).toBe(false);
  const monday = model.days.find((d) => d.day === 'Monday');
  expect(monday!.rows[0]?.[0]?.displayTitle).toBe('CS1010');
});

test('buildRenderableTimetable appends (TA) to display title', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      hidden: [],
      ta: ['CS1010'],
      theme: {
        id: 'eighties',
        showTitle: true,
        timetableOrientation: 'HORIZONTAL',
      },
      timetable: { CS1010: { Lecture: [0] } },
    }),
    fixtureModules,
  );

  const monday = model.days.find((d) => d.day === 'Monday');
  expect(monday!.rows[0]?.[0]?.displayTitle).toBe('CS1010 Programming Methodology (TA)');
});

test('buildRenderableTimetable assigns colors when colors mapping is empty', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      colors: {},
      hidden: [],
      ta: [],
      timetable: {
        CS1010: { Lecture: [0] },
        EG1311: { Laboratory: [0] },
        MA1101R: { Lecture: [0] },
      },
    }),
    fixtureModules,
  );

  const colors = model.moduleCards.map((m) => m.color);
  expect(colors.length).toBe(3);
  colors.forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/));
});

test('buildRenderableTimetable uses provided color indices', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      colors: { CS1010: 0, EG1311: 6, MA1101R: 3 },
      hidden: [],
      ta: [],
      timetable: {
        CS1010: { Lecture: [0] },
        EG1311: { Laboratory: [0] },
        MA1101R: { Lecture: [0] },
      },
    }),
    fixtureModules,
  );

  const cs1010 = model.moduleCards.find((m) => m.moduleCode === 'CS1010');
  const eg1311 = model.moduleCards.find((m) => m.moduleCode === 'EG1311');
  const ma1101r = model.moduleCards.find((m) => m.moduleCode === 'MA1101R');
  expect(cs1010!.color).not.toBe(eg1311!.color);
  expect(cs1010!.color).not.toBe(ma1101r!.color);
});

test('buildRenderableTimetable rewrites E-Learn venues to E-Learning', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      hidden: [],
      ta: [],
      timetable: { EG1311: { Laboratory: [0] } },
    }),
    fixtureModules,
  );

  const saturday = model.days.find((d) => d.day === 'Saturday');
  expect(saturday!.rows[0]?.[0]?.venue).toBe('E-Learning');
});

test('buildRenderableTimetable preserves normal venue names', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      hidden: [],
      ta: [],
      timetable: { CS1010: { Lecture: [0] } },
    }),
    fixtureModules,
  );

  const monday = model.days.find((d) => d.day === 'Monday');
  expect(monday!.rows[0]?.[0]?.venue).toBe('LT19');
});

describe('time boundary calculations', () => {
  test('expands boundaries for early morning lessons', () => {
    const earlyModule: Module[] = [
      {
        moduleCode: 'EARLY',
        moduleCredit: '4',
        semesterData: [
          {
            semester: 1,
            timetable: [
              {
                classNo: '01',
                day: 'Monday',
                endTime: '0900',
                lessonType: 'Lecture',
                startTime: '0800',
                venue: 'LT1',
                weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              },
            ],
          },
        ],
        title: 'Early Module',
      },
    ];

    const model = buildRenderableTimetable(
      makeExportData({
        hidden: [],
        ta: [],
        timetable: { EARLY: { Lecture: [0] } },
      }),
      earlyModule,
    );

    expect(model.startingIndex).toBe(8 * 4);
    expect(model.timeLabels[0]?.label).toBe('0800');
  });

  test('expands boundaries for late evening lessons', () => {
    const lateModule: Module[] = [
      {
        moduleCode: 'LATE',
        moduleCredit: '4',
        semesterData: [
          {
            semester: 1,
            timetable: [
              {
                classNo: '01',
                day: 'Wednesday',
                endTime: '2100',
                lessonType: 'Lecture',
                startTime: '1900',
                venue: 'LT2',
                weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              },
            ],
          },
        ],
        title: 'Late Module',
      },
    ];

    const model = buildRenderableTimetable(
      makeExportData({
        hidden: [],
        ta: [],
        timetable: { LATE: { Lecture: [0] } },
      }),
      lateModule,
    );

    expect(model.endingIndex).toBe(21 * 4);
    const lastLabel = model.timeLabels[model.timeLabels.length - 1];
    expect(lastLabel?.label).toBe('2000');
  });
});

describe('week text formatting', () => {
  function moduleWithWeeks(
    weeks: number[] | { start: string; end: string; weekInterval?: number; weeks?: number[] },
  ): Module[] {
    return [
      {
        moduleCode: 'WK',
        moduleCredit: '4',
        semesterData: [
          {
            semester: 1,
            timetable: [
              {
                classNo: '01',
                day: 'Monday',
                endTime: '1200',
                lessonType: 'Lecture',
                startTime: '1000',
                venue: 'LT1',
                weeks,
              },
            ],
          },
        ],
        title: 'Week Test',
      },
    ];
  }

  function getWeekText(
    weeks: number[] | { start: string; end: string; weekInterval?: number; weeks?: number[] },
  ) {
    const model = buildRenderableTimetable(
      makeExportData({
        hidden: [],
        ta: [],
        timetable: { WK: { Lecture: [0] } },
      }),
      moduleWithWeeks(weeks),
    );
    const monday = model.days.find((d) => d.day === 'Monday');
    return monday!.rows[0]?.[0]?.weekText;
  }

  test('returns null for all 13 weeks', () => {
    expect(getWeekText([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).toBeNull();
  });

  test('returns "Week N" for a single week', () => {
    expect(getWeekText([7])).toBe('Week 7');
  });

  test('returns "Odd Weeks" for odd weeks', () => {
    expect(getWeekText([1, 3, 5, 7, 9, 11, 13])).toBe('Odd Weeks');
  });

  test('returns "Even Weeks" for even weeks', () => {
    expect(getWeekText([2, 4, 6, 8, 10, 12])).toBe('Even Weeks');
  });

  test('collapses consecutive ranges', () => {
    expect(getWeekText([1, 2, 3, 4, 10, 11, 12])).toBe('Weeks 1-4, 10, 11, 12');
    expect(getWeekText([1, 2, 3, 4, 5, 10, 11, 12, 13])).toBe('Weeks 1-5, 10-13');
  });

  test('lists individual non-consecutive weeks', () => {
    expect(getWeekText([1, 3, 5])).toBe('Weeks 1, 3, 5');
  });

  test('handles WeekRange with weeks array', () => {
    expect(getWeekText({ start: '2026-01-13', end: '2026-04-14', weeks: [1, 3, 5] })).toBe(
      'Weeks 1, 3, 5',
    );
  });

  test('handles WeekRange with weekInterval 2', () => {
    expect(getWeekText({ start: '2026-01-13', end: '2026-04-14', weekInterval: 2 })).toBe(
      'Odd Weeks',
    );
  });
});

describe('module card metadata', () => {
  test('includes exam date, duration, and units', () => {
    const model = buildRenderableTimetable(
      makeExportData({
        hidden: [],
        ta: [],
        timetable: { CS1010: { Lecture: [0] } },
      }),
      fixtureModules,
    );

    const card = model.moduleCards.find((m) => m.moduleCode === 'CS1010');
    expect(card!.metaLine).toContain('Exam:');
    expect(card!.metaLine).toContain('2 hrs');
    expect(card!.metaLine).toContain('4 Units');
  });

  test('shows "No Exam" for modules without exam date', () => {
    const noExamModules: Module[] = [
      {
        moduleCode: 'CS3216',
        moduleCredit: '5',
        semesterData: [
          {
            semester: 1,
            timetable: [
              {
                classNo: '01',
                day: 'Monday',
                endTime: '1800',
                lessonType: 'Lecture',
                startTime: '1600',
                venue: 'COM1-0212',
                weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              },
            ],
          },
        ],
        title: 'Software Product Engineering for Digital Markets',
      },
    ];

    const model = buildRenderableTimetable(
      makeExportData({
        hidden: [],
        ta: [],
        timetable: { CS3216: { Lecture: [0] } },
      }),
      noExamModules,
    );

    const card = model.moduleCards.find((m) => m.moduleCode === 'CS3216');
    expect(card!.metaLine).toContain('No Exam');
    expect(card!.metaLine).toContain('5 Units');
  });

  test('formats 1 unit module correctly', () => {
    const oneUnitModule: Module[] = [
      {
        moduleCode: 'CFG1002',
        moduleCredit: '1',
        semesterData: [
          {
            semester: 1,
            timetable: [
              {
                classNo: '01',
                day: 'Friday',
                endTime: '1200',
                lessonType: 'Lecture',
                startTime: '1100',
                venue: 'LT1',
                weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              },
            ],
          },
        ],
        title: 'Career Catalyst',
      },
    ];

    const model = buildRenderableTimetable(
      makeExportData({
        hidden: [],
        ta: [],
        timetable: { CFG1002: { Lecture: [0] } },
      }),
      oneUnitModule,
    );

    const card = model.moduleCards.find((m) => m.moduleCode === 'CFG1002');
    expect(card!.metaLine).toContain('1 Unit');
    expect(card!.metaLine).not.toContain('1 Units');
  });

  test('formats sub-hour exam duration in minutes', () => {
    const modules: Module[] = [
      {
        moduleCode: 'SHORT',
        moduleCredit: '2',
        semesterData: [
          {
            examDate: '2026-05-01T01:00:00.000Z',
            examDuration: 45,
            semester: 1,
            timetable: [
              {
                classNo: '01',
                day: 'Monday',
                endTime: '1100',
                lessonType: 'Lecture',
                startTime: '1000',
                venue: 'LT1',
                weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
              },
            ],
          },
        ],
        title: 'Short Exam',
      },
    ];

    const model = buildRenderableTimetable(
      makeExportData({
        hidden: [],
        ta: [],
        timetable: { SHORT: { Lecture: [0] } },
      }),
      modules,
    );

    const card = model.moduleCards.find((m) => m.moduleCode === 'SHORT');
    expect(card!.metaLine).toContain('45 mins');
  });
});

test('buildRenderableTimetable handles multiple lesson types per module', () => {
  const modules: Module[] = [
    {
      moduleCode: 'CS1010S',
      moduleCredit: '4',
      semesterData: [
        {
          examDate: '2026-05-01T01:00:00.000Z',
          semester: 2,
          timetable: [
            {
              classNo: '01',
              day: 'Monday',
              endTime: '1200',
              lessonType: 'Lecture',
              startTime: '1000',
              venue: 'LT15',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '03',
              day: 'Tuesday',
              endTime: '1300',
              lessonType: 'Tutorial',
              startTime: '1200',
              venue: 'COM1-0210',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '05',
              day: 'Friday',
              endTime: '1100',
              lessonType: 'Recitation',
              startTime: '1000',
              venue: 'SR1',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
          ],
        },
      ],
      title: 'Programming Methodology',
    },
  ];

  const model = buildRenderableTimetable(
    {
      colors: { CS1010S: 0 },
      hidden: [],
      semester: 2,
      settings: { colorScheme: 'LIGHT_COLOR_SCHEME' },
      ta: ['CS1010S'],
      theme: { id: 'ashes', showTitle: true, timetableOrientation: 'VERTICAL' },
      timetable: { CS1010S: { Lecture: [0], Recitation: [2], Tutorial: [1] } },
    },
    modules,
  );

  const allLessons = model.days.flatMap((d) => d.rows.flat());
  expect(allLessons.length).toBe(3);
  expect(allLessons.map((l) => l.lessonMeta).sort()).toEqual(
    ['LEC [01]', 'REC [05]', 'TUT [03]'].sort(),
  );
});

test('buildRenderableTimetable produces correct output for empty timetable', () => {
  const model = buildRenderableTimetable(
    makeExportData({ hidden: [], ta: [], timetable: {} }),
    fixtureModules,
  );

  expect(model.days.length).toBe(5);
  expect(model.moduleCards.length).toBe(0);
  expect(model.activeUnits).toBe(0);
  expect(model.totalUnits).toBe(0);
  expect(model.startingIndex).toBe(10 * 4);
  expect(model.endingIndex).toBe(18 * 4);
});

test('buildRenderableTimetable skips modules not found in module list', () => {
  const model = buildRenderableTimetable(
    makeExportData({
      hidden: [],
      ta: [],
      timetable: {
        CS1010: { Lecture: [0] },
        GHOST9999: { Lecture: [0] },
      },
    }),
    fixtureModules,
  );

  const allLessons = model.days.flatMap((d) => d.rows.flat());
  expect(allLessons.every((l) => l.moduleCode === 'CS1010')).toBe(true);
  expect(model.moduleCards.find((m) => m.moduleCode === 'GHOST9999')).toBeUndefined();
});

test('buildRenderableTimetable filters by semester', () => {
  const multiSemModule: Module[] = [
    {
      moduleCode: 'CP3880',
      moduleCredit: '12',
      semesterData: [
        {
          semester: 1,
          timetable: [
            {
              classNo: '01',
              day: 'Monday',
              endTime: '1200',
              lessonType: 'Lecture',
              startTime: '1000',
              venue: 'LT1',
              weeks: [1, 2, 3],
            },
          ],
        },
        {
          semester: 3,
          timetable: [
            {
              classNo: '01',
              day: 'Wednesday',
              endTime: '1400',
              lessonType: 'Lecture',
              startTime: '1200',
              venue: 'LT5',
              weeks: [1, 2, 3, 4, 5, 6],
            },
          ],
        },
      ],
      title: 'Industrial Attachment',
    },
  ];

  const model = buildRenderableTimetable(
    {
      colors: { CP3880: 2 },
      hidden: [],
      semester: 3,
      settings: { colorScheme: 'LIGHT_COLOR_SCHEME' },
      ta: [],
      theme: {
        id: 'paraiso',
        showTitle: false,
        timetableOrientation: 'HORIZONTAL',
      },
      timetable: { CP3880: { Lecture: [0] } },
    },
    multiSemModule,
  );

  const wednesday = model.days.find((d) => d.day === 'Wednesday');
  expect(wednesday).toBeDefined();
  expect(wednesday!.rows[0]?.[0]?.moduleCode).toBe('CP3880');
  expect(model.themeId).toBe('paraiso');
});

test('buildRenderableTimetable generates correct lesson abbreviations', () => {
  const modules: Module[] = [
    {
      moduleCode: 'HSI1000',
      moduleCredit: '4',
      semesterData: [
        {
          semester: 2,
          timetable: [
            {
              classNo: '72',
              day: 'Monday',
              endTime: '1200',
              lessonType: 'Workshop',
              startTime: '1000',
              venue: 'AS7-0101',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '87',
              day: 'Wednesday',
              endTime: '1200',
              lessonType: 'Workshop',
              startTime: '1000',
              venue: 'AS7-0102',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '27',
              day: 'Thursday',
              endTime: '1200',
              lessonType: 'Lecture',
              startTime: '1000',
              venue: 'LT14',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
          ],
        },
      ],
      title: 'Understanding the Chinese Community in Southeast Asia',
    },
  ];

  const model = buildRenderableTimetable(
    {
      colors: { HSI1000: 7 },
      hidden: [],
      semester: 2,
      settings: { colorScheme: 'DARK_COLOR_SCHEME' },
      ta: [],
      theme: {
        id: 'tomorrow',
        showTitle: false,
        timetableOrientation: 'HORIZONTAL',
      },
      timetable: { HSI1000: { Lecture: [2], Workshop: [0, 1] } },
    },
    modules,
  );

  const allLessons = model.days.flatMap((d) => d.rows.flat());
  const workshops = allLessons.filter((l) => l.lessonMeta.startsWith('WS'));
  const lectures = allLessons.filter((l) => l.lessonMeta.startsWith('LEC'));
  expect(workshops.length).toBe(2);
  expect(lectures.length).toBe(1);
  expect(workshops[0]?.lessonMeta).toBe('WS [72]');
});

describe('activeUnits and totalUnits calculations', () => {
  test('TA modules do not count toward activeUnits', () => {
    const model = buildRenderableTimetable(
      makeExportData({
        hidden: [],
        ta: ['CS1010', 'MA1101R', 'EG1311'],
        timetable: {
          CS1010: { Lecture: [0] },
          EG1311: { Laboratory: [0] },
          MA1101R: { Lecture: [0] },
        },
      }),
      fixtureModules,
    );

    expect(model.totalUnits).toBe(12);
    expect(model.activeUnits).toBe(0);
  });

  test('hidden modules do not count toward activeUnits', () => {
    const model = buildRenderableTimetable(
      makeExportData({
        hidden: ['CS1010', 'MA1101R', 'EG1311'],
        ta: [],
        timetable: {
          CS1010: { Lecture: [0] },
          EG1311: { Laboratory: [0] },
          MA1101R: { Lecture: [0] },
        },
      }),
      fixtureModules,
    );

    expect(model.totalUnits).toBe(12);
    expect(model.activeUnits).toBe(0);
  });
});

describe('heavy timetable with 5 modules', () => {
  const heavyModules: Module[] = [
    {
      moduleCode: 'CS3230',
      moduleCredit: '4',
      semesterData: [
        {
          examDate: '2026-05-02T01:00:00.000Z',
          semester: 2,
          timetable: [
            {
              classNo: '11',
              day: 'Monday',
              endTime: '1200',
              lessonType: 'Tutorial',
              startTime: '1100',
              venue: 'COM1-0201',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '07',
              day: 'Wednesday',
              endTime: '1400',
              lessonType: 'Lecture',
              startTime: '1200',
              venue: 'LT19',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
          ],
        },
      ],
      title: 'Design and Analysis of Algorithms',
    },
    {
      moduleCode: 'CS3235',
      moduleCredit: '4',
      semesterData: [
        {
          examDate: '2026-05-04T01:00:00.000Z',
          semester: 2,
          timetable: [
            {
              classNo: '01',
              day: 'Tuesday',
              endTime: '1200',
              lessonType: 'Lecture',
              startTime: '1000',
              venue: 'LT15',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '02',
              day: 'Tuesday',
              endTime: '1500',
              lessonType: 'Tutorial',
              startTime: '1400',
              venue: 'COM1-0208',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
          ],
        },
      ],
      title: 'Computer Security',
    },
    {
      moduleCode: 'CS2108',
      moduleCredit: '4',
      semesterData: [
        {
          examDate: '2026-05-06T01:00:00.000Z',
          semester: 2,
          timetable: [
            {
              classNo: '02',
              day: 'Thursday',
              endTime: '1200',
              lessonType: 'Lecture',
              startTime: '1000',
              venue: 'LT17',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '05',
              day: 'Thursday',
              endTime: '1400',
              lessonType: 'Tutorial',
              startTime: '1300',
              venue: 'COM1-0210',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
          ],
        },
      ],
      title: 'Introduction to Media Computing',
    },
    {
      moduleCode: 'CS2100',
      moduleCredit: '4',
      semesterData: [
        {
          examDate: '2026-05-08T01:00:00.000Z',
          examDuration: 120,
          semester: 2,
          timetable: [
            {
              classNo: '01',
              day: 'Monday',
              endTime: '1400',
              lessonType: 'Lecture',
              startTime: '1200',
              venue: 'LT19',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '08',
              day: 'Friday',
              endTime: '1100',
              lessonType: 'Tutorial',
              startTime: '1000',
              venue: 'COM1-0208',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '03',
              day: 'Friday',
              endTime: '1300',
              lessonType: 'Laboratory',
              startTime: '1100',
              venue: 'COM1-0113',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
          ],
        },
      ],
      title: 'Computer Organisation',
    },
    {
      moduleCode: 'DSA1101',
      moduleCredit: '4',
      semesterData: [
        {
          examDate: '2026-05-10T01:00:00.000Z',
          semester: 2,
          timetable: [
            {
              classNo: '03',
              day: 'Wednesday',
              endTime: '1100',
              lessonType: 'Tutorial',
              startTime: '1000',
              venue: 'S16-0436',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
            {
              classNo: '08',
              day: 'Thursday',
              endTime: '1600',
              lessonType: 'Lecture',
              startTime: '1400',
              venue: 'LT27',
              weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            },
          ],
        },
      ],
      title: 'Introduction to Data Science',
    },
  ];

  test('builds correct model for heavy CS load (google theme)', () => {
    const model = buildRenderableTimetable(
      {
        colors: { CS2100: 6, CS2108: 2, CS3230: 4, CS3235: 0, DSA1101: 5 },
        hidden: [],
        semester: 2,
        settings: { colorScheme: 'LIGHT_COLOR_SCHEME' },
        ta: [],
        theme: {
          id: 'google',
          showTitle: false,
          timetableOrientation: 'HORIZONTAL',
        },
        timetable: {
          CS2100: { Laboratory: [2], Lecture: [0], Tutorial: [1] },
          CS2108: { Lecture: [0], Tutorial: [1] },
          CS3230: { Lecture: [1], Tutorial: [0] },
          CS3235: { Lecture: [0], Tutorial: [1] },
          DSA1101: { Lecture: [1], Tutorial: [0] },
        },
      },
      heavyModules,
    );

    expect(model.moduleCards.length).toBe(5);
    expect(model.totalUnits).toBe(20);
    expect(model.activeUnits).toBe(20);

    const allLessons = model.days.flatMap((d) => d.rows.flat());
    expect(allLessons.length).toBe(11);

    expect(model.days.some((d) => d.day === 'Saturday')).toBe(false);
    expect(model.themeId).toBe('google');
  });
});

test('renderSatoriImage returns a PNG buffer for horizontal', async () => {
  const png = await renderSatoriImage(
    makeExportData({
      hidden: [],
      ta: [],
      timetable: {
        CS1010: { Lecture: [0], Tutorial: [1] },
      },
    }),
    fixtureModules,
    { width: 900 },
  );

  expect(Buffer.isBuffer(png)).toBe(true);
  expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test('renderSatoriImage returns a PNG buffer for vertical', async () => {
  const png = await renderSatoriImage(
    makeExportData({
      hidden: [],
      ta: [],
      theme: {
        id: 'eighties',
        showTitle: false,
        timetableOrientation: 'VERTICAL',
      },
      timetable: {
        CS1010: { Lecture: [0], Tutorial: [1] },
      },
    }),
    fixtureModules,
    { width: 900 },
  );

  expect(Buffer.isBuffer(png)).toBe(true);
  expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test('renderSatoriImage works with dark mode and monokai theme', async () => {
  const png = await renderSatoriImage(
    makeExportData({
      hidden: [],
      settings: { colorScheme: 'DARK_COLOR_SCHEME' },
      ta: ['MA1101R'],
      theme: {
        id: 'monokai',
        showTitle: true,
        timetableOrientation: 'HORIZONTAL',
      },
      timetable: {
        CS1010: { Lecture: [0], Tutorial: [1] },
        MA1101R: { Lecture: [0] },
      },
    }),
    fixtureModules,
    { width: 900 },
  );

  expect(Buffer.isBuffer(png)).toBe(true);
  expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});
