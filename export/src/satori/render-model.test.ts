import assert from 'node:assert/strict';
import test from 'node:test';

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

  assert.ok(monday);
  assert.equal(monday.rows.length, 2);
  assert.equal(
    model.days.some((day) => day.day === 'Saturday'),
    false,
  );
  assert.equal(model.activeUnits, 4);
  assert.equal(model.totalUnits, 12);
  assert.equal(monday.rows[0]?.[0]?.weekText, 'Weeks 1, 2, 3');
  assert.equal(model.moduleCards.find((module) => module.moduleCode === 'MA1101R')?.isTa, true);
  assert.equal(model.moduleCards.find((module) => module.moduleCode === 'EG1311')?.isHidden, true);
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

  assert.equal(
    model.days.some((day) => day.day === 'Saturday'),
    true,
  );
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

  assert.deepEqual(
    model.moduleCards.map((module) => module.moduleCode),
    ['EG1311', 'CS1010', 'MA1101R'],
  );
});

test('buildRenderableTimetable sets isVertical based on orientation', () => {
  const horizontal = buildRenderableTimetable(makeExportData(), fixtureModules);
  assert.equal(horizontal.isVertical, false);

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
  assert.equal(vertical.isVertical, true);
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

  assert.ok(Buffer.isBuffer(png));
  assert.deepEqual(Array.from(png.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
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

  assert.ok(Buffer.isBuffer(png));
  assert.deepEqual(Array.from(png.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
});
