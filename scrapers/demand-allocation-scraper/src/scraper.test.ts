import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  DemandAllocationScraper,
  getCourseRegRounds,
  groupCourseRegHistory,
  mergeCourseRegHistories,
  mergeCourseRegRound,
  parseDemandAllocationCsv,
  parseVacancyCsv,
} from './scraper';

const makeTempDir = () => mkdtemp(path.join(os.tmpdir(), 'demand-allocation-scraper-test-'));

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
    expect(getCourseRegRounds('2025/2026')).toEqual([1, 2, 3]);
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
          allocatedSlots: 'notAvailable',
          forecastedSlots: 200,
          registered: null,
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
          allocatedSlots: 'notAvailable',
          forecastedSlots: 750,
          registered: null,
          round: 1,
        },
        studentType: 'UG',
      },
    ]);
  });
});

describe(groupCourseRegHistory, () => {
  test('groups round histories by module, student type, and class', () => {
    const rows = [
      ...mergeCourseRegRound(
        1,
        'UG',
        parseDemandAllocationCsv(
          'Faculty,Department,Code,Title,Class,Vacancy,Demand\nComputing,CS,CS2030S,Programming,L1,772,772',
        ),
        parseVacancyCsv(
          'Faculty,Department,Code,Title,Class,UG,GD\nComputing,CS,CS2030S,Programming,L1,750,-1',
        ),
      ),
      ...mergeCourseRegRound(
        2,
        'UG',
        parseDemandAllocationCsv(
          'Faculty,Department,Code,Title,Class,Vacancy,Demand\nComputing,CS,CS2030S,Programming,L1,772,760',
        ),
        parseVacancyCsv(
          'Faculty,Department,Code,Title,Class,UG,GD\nComputing,CS,CS2030S,Programming,L1,772,-1',
        ),
      ),
    ];

    expect(groupCourseRegHistory('2025/2026', 2, rows)).toEqual([
      {
        acadYear: '2025/2026',
        classes: [
          {
            classNo: 'L1',
            rounds: [
              {
                allocatedSlots: 772,
                forecastedSlots: 750,
                registered: 772,
                round: 1,
              },
              {
                allocatedSlots: 772,
                forecastedSlots: 772,
                registered: 760,
                round: 2,
              },
            ],
            studentType: 'UG',
          },
        ],
        moduleCode: 'CS2030S',
        semester: 2,
      },
    ]);
  });

  test('matches CourseRekt known AY22/23 Sem 2 UG CS2030S history', () => {
    const demandCsvs = [
      'Faculty,Department,Code,Title,Class,Vacancy,Demand,Successful_Main,Successful_Reserve,Quota_Exceeded,Timetable_Clashes,Workload_Exceeded,Others\nSchool of Computing,Computer Science,CS2030S,Programming Methodology II,L1,700,693,693,0,0,0,0,0',
      'Faculty,Department,Code,Title,Class,Vacancy,Demand,Successful_Main,Successful_Reserve,Quota_Exceeded,Timetable_Clashes,Workload_Exceeded,Others\nSchool of Computing,Computer Science,CS2030S,Programming Methodology II,L1,31,52,31,0,21,0,0,0',
      'Faculty,Department,Code,Title,Class,Vacancy,Demand,Successful_Main,Successful_Reserve,Quota_Exceeded,Timetable_Clashes,Workload_Exceeded,Others\nSchool of Computing,Computer Science,CS2030S,Programming Methodology II,L1,7,18,7,0,11,0,0,0',
      'Faculty,Department,Code,Title,Class,Vacancy,Demand,Successful_Main,Successful_Reserve,Quota_Exceeded,Timetable_Clashes,Workload_Exceeded,Others\nSchool of Computing,Computer Science,CS2030S,Programming Methodology II,L1,2,6,0,0,0,0,0,6',
    ];
    const vacancyCsvs = [
      'Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE\nSchool of Computing,Computer Science,CS2030S,Programming Methodology II,L1,580,-1,-1,-1,-1',
      'Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE\nSchool of Computing,Computer Science,CS2030S,Programming Methodology II,L1,24,-1,-1,-1,-1',
      'Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE\nSchool of Computing,Computer Science,CS2030S,Programming Methodology II,L1,3,-1,-1,-1,-1',
      'Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE\nSchool of Computing,Computer Science,CS2030S,Programming Methodology II,L1,0,-1,-1,-1,-1',
    ];
    const rows = demandCsvs.flatMap((demandCsv, round) =>
      mergeCourseRegRound(
        round as 0 | 1 | 2 | 3,
        'UG',
        parseDemandAllocationCsv(demandCsv),
        parseVacancyCsv(vacancyCsvs[round]),
      ),
    );

    expect(groupCourseRegHistory('2022/2023', 2, rows)).toEqual([
      {
        acadYear: '2022/2023',
        classes: [
          {
            classNo: 'L1',
            rounds: [
              {
                allocatedSlots: 700,
                forecastedSlots: 580,
                registered: 693,
                round: 0,
              },
              {
                allocatedSlots: 31,
                forecastedSlots: 24,
                registered: 52,
                round: 1,
              },
              {
                allocatedSlots: 7,
                forecastedSlots: 3,
                registered: 18,
                round: 2,
              },
              {
                allocatedSlots: 2,
                forecastedSlots: 0,
                registered: 6,
                round: 3,
              },
            ],
            studentType: 'UG',
          },
        ],
        moduleCode: 'CS2030S',
        semester: 2,
      },
    ]);
  });
});

describe(mergeCourseRegHistories, () => {
  test('replaces only the selected round and preserves existing rounds', () => {
    expect(
      mergeCourseRegHistories(
        [
          {
            acadYear: '2025/2026',
            classes: [
              {
                classNo: 'L1',
                rounds: [
                  {
                    allocatedSlots: 700,
                    forecastedSlots: 700,
                    registered: 650,
                    round: 1,
                  },
                  {
                    allocatedSlots: 50,
                    forecastedSlots: 50,
                    registered: 17,
                    round: 2,
                  },
                ],
                studentType: 'UG',
              },
              {
                classNo: 'T1',
                rounds: [
                  {
                    allocatedSlots: 10,
                    forecastedSlots: 10,
                    registered: 8,
                    round: 1,
                  },
                ],
                studentType: 'UG',
              },
            ],
            moduleCode: 'CS2030S',
            semester: 2,
          },
        ],
        [
          {
            acadYear: '2025/2026',
            classes: [
              {
                classNo: 'L1',
                rounds: [
                  {
                    allocatedSlots: 60,
                    forecastedSlots: 60,
                    registered: 20,
                    round: 2,
                  },
                ],
                studentType: 'UG',
              },
              {
                classNo: 'L2',
                rounds: [
                  {
                    allocatedSlots: 25,
                    forecastedSlots: 25,
                    registered: 10,
                    round: 2,
                  },
                ],
                studentType: 'UG',
              },
            ],
            moduleCode: 'CS2030S',
            semester: 2,
          },
        ],
        [2],
      ),
    ).toEqual([
      {
        acadYear: '2025/2026',
        classes: [
          {
            classNo: 'L1',
            rounds: [
              {
                allocatedSlots: 700,
                forecastedSlots: 700,
                registered: 650,
                round: 1,
              },
              {
                allocatedSlots: 60,
                forecastedSlots: 60,
                registered: 20,
                round: 2,
              },
            ],
            studentType: 'UG',
          },
          {
            classNo: 'L2',
            rounds: [
              {
                allocatedSlots: 25,
                forecastedSlots: 25,
                registered: 10,
                round: 2,
              },
            ],
            studentType: 'UG',
          },
          {
            classNo: 'T1',
            rounds: [
              {
                allocatedSlots: 10,
                forecastedSlots: 10,
                registered: 8,
                round: 1,
              },
              {
                allocatedSlots: 'notAvailable',
                forecastedSlots: 'notAvailable',
                registered: null,
                round: 2,
              },
            ],
            studentType: 'UG',
          },
        ],
        moduleCode: 'CS2030S',
        semester: 2,
      },
    ]);
  });
});

describe(DemandAllocationScraper, () => {
  test('writes semester-level CourseReg history JSON from staged CSVs', async () => {
    const inputDir = await makeTempDir();
    const outputDir = await makeTempDir();
    await writeFixture(
      inputDir,
      path.join('vacancy', 'round_1.csv'),
      `Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE
Computing,Computer Science,CS2030S,Programming Methodology II,L1,750,-1,-1,-1,-1
`,
    );
    await writeFixture(
      inputDir,
      path.join('ug', 'round_1.csv'),
      `Faculty,Department,Code,Title,Class,Vacancy,Demand,Successful_Main,Successful_Reserve,Quota_Exceeded,Timetable_Clashes,Workload_Exceeded,Others
Computing,Computer Science,CS2030S,Programming Methodology II,L1,772,772,772,0,0,0,0,0
`,
    );

    const histories = await new DemandAllocationScraper(2, '2025/2026', {
      inputDir,
      outputDir,
      round: 1,
    }).run();
    const outputJson = JSON.parse(
      await readFile(path.join(outputDir, 'semesters', '2', 'courseRegHistory.json'), 'utf8'),
    );

    expect(histories).toHaveLength(1);
    expect(outputJson).toEqual(histories);
  });

  test('honors a constructor-level round option, including Round 0', async () => {
    const inputDir = await makeTempDir();
    const outputDir = await makeTempDir();
    await writeFixture(
      inputDir,
      path.join('vacancy', 'round_0.csv'),
      `Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE
Computing,Computer Science,CS2030S,Programming Methodology II,L1,580,-1,-1,-1,-1
`,
    );
    await writeFixture(
      inputDir,
      path.join('ug', 'round_0.csv'),
      `Faculty,Department,Code,Title,Class,Vacancy,Demand,Successful_Main,Successful_Reserve,Quota_Exceeded,Timetable_Clashes,Workload_Exceeded,Others
Computing,Computer Science,CS2030S,Programming Methodology II,L1,700,693,693,0,0,0,0,0
`,
    );

    const histories = await new DemandAllocationScraper(2, '2022/2023', {
      inputDir,
      outputDir,
      round: 0,
    }).run();

    expect(histories[0].classes[0].rounds).toEqual([
      {
        allocatedSlots: 700,
        forecastedSlots: 580,
        registered: 693,
        round: 0,
      },
    ]);
  });

  test('merges a single-round scrape into existing semester history JSON', async () => {
    const inputDir = await makeTempDir();
    const outputDir = await makeTempDir();
    await writeFixture(
      outputDir,
      path.join('semesters', '2', 'courseRegHistory.json'),
      JSON.stringify([
        {
          acadYear: '2025/2026',
          classes: [
            {
              classNo: 'L1',
              rounds: [
                {
                  allocatedSlots: 700,
                  forecastedSlots: 700,
                  registered: 650,
                  round: 1,
                },
              ],
              studentType: 'UG',
            },
            {
              classNo: 'T1',
              rounds: [
                {
                  allocatedSlots: 10,
                  forecastedSlots: 10,
                  registered: 8,
                  round: 1,
                },
              ],
              studentType: 'UG',
            },
          ],
          moduleCode: 'CS2030S',
          semester: 2,
        },
      ]),
    );
    await writeFixture(
      inputDir,
      path.join('vacancy', 'round_2.csv'),
      `Faculty,Department,Code,Title,Class,UG,GD,DK,NG,CPE
Computing,Computer Science,CS2030S,Programming Methodology II,L1,50,-1,-1,-1,-1
`,
    );
    await writeFixture(
      inputDir,
      path.join('ug', 'round_2.csv'),
      `Faculty,Department,Code,Title,Class,Vacancy,Demand,Successful_Main,Successful_Reserve,Quota_Exceeded,Timetable_Clashes,Workload_Exceeded,Others
Computing,Computer Science,CS2030S,Programming Methodology II,L1,50,17,17,0,0,0,0,0
`,
    );

    const histories = await new DemandAllocationScraper(2, '2025/2026', {
      inputDir,
      outputDir,
      round: 2,
    }).run();

    expect(histories[0].classes).toEqual([
      {
        classNo: 'L1',
        rounds: [
          {
            allocatedSlots: 700,
            forecastedSlots: 700,
            registered: 650,
            round: 1,
          },
          {
            allocatedSlots: 50,
            forecastedSlots: 50,
            registered: 17,
            round: 2,
          },
        ],
        studentType: 'UG',
      },
      {
        classNo: 'T1',
        rounds: [
          {
            allocatedSlots: 10,
            forecastedSlots: 10,
            registered: 8,
            round: 1,
          },
          {
            allocatedSlots: 'notAvailable',
            forecastedSlots: 'notAvailable',
            registered: null,
            round: 2,
          },
        ],
        studentType: 'UG',
      },
    ]);
  });

  test('fails when no CourseReg histories can be extracted', async () => {
    await expect(
      new DemandAllocationScraper(2, '2025/2026', {
        inputDir: await makeTempDir(),
        outputDir: await makeTempDir(),
        round: 1,
      }).run(),
    ).rejects.toThrow('No CourseReg history extracted');
  });
});
