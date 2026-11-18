import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { onTestFinished } from 'vitest';

import {
  DemandAllocationScraper,
  getCourseRegRounds,
  groupCourseRegHistory,
  mergeCourseRegHistories,
  mergeCourseRegRound,
  parseDemandAllocationCsv,
  parseVacancyCsv,
} from './scraper';
import type { CourseRegClassHistory } from './types';

const makeTempDir = async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'demand-allocation-scraper-test-'));
  onTestFinished(() => rm(dir, { force: true, recursive: true }));
  return dir;
};

const writeFixture = async (root: string, file: string, contents: string) => {
  const outputPath = path.join(root, file);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, contents, { flag: 'w' });
};

describe(getCourseRegRounds, () => {
  test('includes Round 0 before AY24/25', () => {
    expect(getCourseRegRounds('2023/2024')).toEqual([0, 1, 2, 3]);
  });

  test('omits Round 0 from AY24/25 onward', () => {
    expect(getCourseRegRounds('2024/2025')).toEqual([1, 2, 3]);
  });
});

describe(parseDemandAllocationCsv, () => {
  test('removes headers, repairs split rows, and parses capacity values', () => {
    const rows =
      parseDemandAllocationCsv(`Course Host Faculty/School,Course Host Department,Course Code,Course Title,Course Class,Vacancy,Demand,Successful Allocations,Unsuccessful Allocations due to:,,,,
Faculty of Science,Statistics,ST2131,Probability,L1,200,180,180,0,0,0,0
Yale-NUS College,Yale-NUS College,YSS4206C,"Topics in Psychology: The Pursuit of",E1,15,9,9,2,0,0,0,0
,,,Happiness,,,,,,,,
FoL,FoL Dean's Office,LL4002V,Admiralty Law,E1,-,3,3,0,0,0,0,0
Engineering,Common Engineering,EG1001,Engineering Practice,L1,,5,5,0,0,0,0,0
Engineering,Common Engineering,EG1002,Engineering Practice II,L1,,0,0,0,0,0,0,0
`);

    expect(rows).toEqual([
      {
        allocatedSlots: 200,
        classNo: 'L1',
        moduleCode: 'ST2131',
        registered: 180,
      },
      {
        allocatedSlots: 15,
        classNo: 'E1',
        moduleCode: 'YSS4206C',
        registered: 9,
      },
      {
        allocatedSlots: 'unlimited',
        classNo: 'E1',
        moduleCode: 'LL4002V',
        registered: 3,
      },
      {
        allocatedSlots: 'unlimited',
        classNo: 'L1',
        moduleCode: 'EG1001',
        registered: 5,
      },
      {
        allocatedSlots: 'notAvailable',
        classNo: 'L1',
        moduleCode: 'EG1002',
        registered: 0,
      },
    ]);
  });
});

describe(parseVacancyCsv, () => {
  test('deduplicates rows, trims class labels, and parses unavailable capacity', () => {
    const rows =
      parseVacancyCsv(`Faculty/School,Department,Course Code,Course Title,Course Class,UG,GD,DK,NG,CPE
NUS,NUS Enterprise Academy,BSN3701,Technological Innovation,Sectional Teaching - SA1 - 123,17,-1,-1,30,3
NUS Business School,Strategy and Policy,BSN3701,Technological Innovation,Sectional Teaching - SA1 - 123,17,-1,-1,30,3
Faculty of Science,Statistics and Data Science,ST2131,Probability,Lecture - L1,200,-,-1,-1,-1
Faculty of Law,FoL Dean's Office,LL4002V,Admiralty Law,Seminar - E1,,3,-1,-1,-1
`);

    expect(rows).toEqual([
      {
        classNo: 'SA1',
        forecastedSlots: {
          GD: 'notAvailable',
          UG: 17,
        },
        moduleCode: 'BSN3701',
      },
      {
        classNo: 'L1',
        forecastedSlots: {
          GD: 'unlimited',
          UG: 200,
        },
        moduleCode: 'ST2131',
      },
      {
        classNo: 'E1',
        forecastedSlots: {
          GD: 3,
          UG: 'notAvailable',
        },
        moduleCode: 'LL4002V',
      },
    ]);
  });
});

describe(mergeCourseRegRound, () => {
  test('full joins demand and vacancy rows by module and class', () => {
    const demandRows =
      parseDemandAllocationCsv(`Faculty,Department,Code,Title,Class,Vacancy,Demand,Successful_Main,Successful_Reserve,Quota_Exceeded,Timetable_Clashes,Workload_Exceeded,Others
Computing,Computer Science,CS2030S,Programming Methodology II,L1,772,772,772,0,0,0,0,0
Business,Accounting,ACC1701A,Accounting,SA1,40,35,35,0,0,0,0,0
`);
    const vacancyRows = parseVacancyCsv(`Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE
Computing,Computer Science,CS2030S,Programming Methodology II,L1,750,-1,-1,-1,-1
Science,Statistics,ST2131,Probability,L1,200,-1,-1,-1,-1
`);

    expect(mergeCourseRegRound(1, 'UG', demandRows, vacancyRows)).toEqual([
      {
        classNo: 'SA1',
        moduleCode: 'ACC1701A',
        roundHistory: {
          allocatedSlots: 40,
          forecastedSlots: 'notAvailable',
          registered: 35,
          round: 1,
        },
        studentType: 'UG',
      },
      {
        classNo: 'L1',
        moduleCode: 'CS2030S',
        roundHistory: {
          allocatedSlots: 772,
          forecastedSlots: 750,
          registered: 772,
          round: 1,
        },
        studentType: 'UG',
      },
      {
        classNo: 'L1',
        moduleCode: 'ST2131',
        roundHistory: {
          allocatedSlots: 200,
          forecastedSlots: 200,
          registered: 0,
          round: 1,
        },
        studentType: 'UG',
      },
    ]);
  });

  test('ignores vacancy-only rows unavailable to the selected student type', () => {
    const vacancyRows = parseVacancyCsv(`Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE
Computing,Computer Science,CS2030S,Programming Methodology II,L1,750,-1,-1,-1,-1
`);

    expect(mergeCourseRegRound(1, 'GD', [], vacancyRows)).toEqual([]);
    expect(mergeCourseRegRound(1, 'UG', [], vacancyRows)).toEqual([
      {
        classNo: 'L1',
        moduleCode: 'CS2030S',
        roundHistory: {
          allocatedSlots: 750,
          forecastedSlots: 750,
          registered: 0,
          round: 1,
        },
        studentType: 'UG',
      },
    ]);
  });
});

test('matches CourseRekt history for AY22/23 Semester 2 UG CS2030S', () => {
  const expectedRounds = [
    { allocatedSlots: 700, forecastedSlots: 580, registered: 693, round: 0 },
    { allocatedSlots: 31, forecastedSlots: 24, registered: 52, round: 1 },
    { allocatedSlots: 7, forecastedSlots: 3, registered: 18, round: 2 },
    { allocatedSlots: 2, forecastedSlots: 0, registered: 6, round: 3 },
  ] as const;
  const demandHeader = 'Faculty,Department,Code,Title,Class,Vacancy,Demand';
  const vacancyHeader = 'Faculty,Department,Code,Title,Class,UG,GD';
  const classRow = 'School of Computing,Computer Science,CS2030S,Programming Methodology II,L1';
  const rows = expectedRounds.flatMap(({ allocatedSlots, forecastedSlots, registered, round }) =>
    mergeCourseRegRound(
      round,
      'UG',
      parseDemandAllocationCsv(`${demandHeader}\n${classRow},${allocatedSlots},${registered}`),
      parseVacancyCsv(`${vacancyHeader}\n${classRow},${forecastedSlots},-1`),
    ),
  );

  expect(groupCourseRegHistory('2022/2023', 2, rows)).toEqual([
    {
      acadYear: '2022/2023',
      classes: [{ classNo: 'L1', rounds: expectedRounds, studentType: 'UG' }],
      moduleCode: 'CS2030S',
      semester: 2,
    },
  ]);
});

test('replaces one round, preserves other rounds, and marks absent classes', () => {
  const module = { acadYear: '2025/2026', moduleCode: 'CS2030S', semester: 2 } as const;
  const round1 = { allocatedSlots: 700, forecastedSlots: 700, registered: 650, round: 1 } as const;
  const oldRound2 = { allocatedSlots: 50, forecastedSlots: 50, registered: 17, round: 2 } as const;
  const round2 = { allocatedSlots: 60, forecastedSlots: 60, registered: 20, round: 2 } as const;
  const lecture = { classNo: 'L1', studentType: 'UG' } as const;
  const newLecture = {
    classNo: 'L2',
    rounds: [{ allocatedSlots: 25, forecastedSlots: 25, registered: 10, round: 2 }],
    studentType: 'UG',
  } satisfies CourseRegClassHistory;
  const tutorial = {
    classNo: 'T1',
    rounds: [round1],
    studentType: 'UG',
  } satisfies CourseRegClassHistory;

  expect(
    mergeCourseRegHistories(
      [{ ...module, classes: [{ ...lecture, rounds: [round1, oldRound2] }, tutorial] }],
      [{ ...module, classes: [{ ...lecture, rounds: [round2] }, newLecture] }],
      [2],
    ),
  ).toEqual([
    {
      ...module,
      classes: [
        { ...lecture, rounds: [round1, round2] },
        newLecture,
        {
          ...tutorial,
          rounds: [
            round1,
            {
              allocatedSlots: 'notAvailable',
              forecastedSlots: 'notAvailable',
              registered: null,
              round: 2,
            },
          ],
        },
      ],
    },
  ]);
});

describe(DemandAllocationScraper, () => {
  test('writes a Round 0 update into existing semester history', async () => {
    const dir = await makeTempDir();
    const historyFile = path.join('semesters', '2', 'courseRegHistory.json');
    const module = { acadYear: '2022/2023', moduleCode: 'CS2030S', semester: 2 };
    const round1 = { allocatedSlots: 31, forecastedSlots: 24, registered: 52, round: 1 };
    const lecture = { classNo: 'L1', studentType: 'UG' };
    await writeFixture(
      dir,
      historyFile,
      JSON.stringify([{ ...module, classes: [{ ...lecture, rounds: [round1] }] }]),
    );
    await writeFixture(
      dir,
      path.join('vacancy', 'round_0.csv'),
      'Faculty,Department,Code,Title,Class,UG,GD\nComputing,CS,CS2030S,Programming,L1,580,-1\n',
    );
    await writeFixture(
      dir,
      path.join('ug', 'round_0.csv'),
      'Faculty,Department,Code,Title,Class,Vacancy,Demand\nComputing,CS,CS2030S,Programming,L1,700,693\n',
    );

    await new DemandAllocationScraper(2, module.acadYear, {
      inputDir: dir,
      outputDir: dir,
      round: 0,
    }).run();

    expect(JSON.parse(await readFile(path.join(dir, historyFile), 'utf8'))).toEqual([
      {
        ...module,
        classes: [
          {
            ...lecture,
            rounds: [
              { allocatedSlots: 700, forecastedSlots: 580, registered: 693, round: 0 },
              round1,
            ],
          },
        ],
      },
    ]);
  });

  test('fails when no CourseReg histories can be extracted', async () => {
    const dir = await makeTempDir();
    await expect(
      new DemandAllocationScraper(2, '2025/2026', { inputDir: dir, outputDir: dir }).run(),
    ).rejects.toThrow('No CourseReg history extracted');
  });
});
