import parseString from './parseString';
import { mockLogger } from '../../utils/test-utils';
import { PrereqTree } from '../../types/modules';

// integration tests, normalize + parse
const logger = mockLogger();
const parse = (string: string) => parseString(string, logger);

describe(parseString, () => {
  // A graduate-only wrapper is kept and labelled (undergraduates are excluded),
  // unlike the ubiquitous undergraduate wrapper which is dropped as assumed.
  it('keeps the program-type label for a graduate-only module', () => {
    const result: PrereqTree = {
      programType: { rule: 'IF_IN', types: ['Graduate Degree Coursework'] },
      then: 'BMF5322',
    };
    expect(
      parse(
        `
        PROGRAMME_TYPES IF_IN Graduate Degree Coursework
        THEN
        (
          MODULES (1) BMF5322
        )
      `,
      ),
    ).toEqual(result);
  });

  it('parses basic undergrad with multiple modules)', () => {
    const result: PrereqTree = { or: ['PH2110:D', 'GEM2006:D', 'GET1028:D'] };
    expect(
      parse(
        `
      PROGRAMME_TYPES IF_IN Undergraduate Degree
      THEN
      (
        MODULES (1) PH2110:D,GEM2006:D,GET1028:D
      )
      `,
      ),
    ).toEqual(result);
  });

  it('parses complex undergrad with multiple modules and simplifies tree)', () => {
    const result: PrereqTree = {
      and: [
        {
          or: [
            { nOf: [7, ['PH%:D', 'GET1029:D']] },
            {
              and: [
                { cohort: { rule: 'MUST_BE_IN', years: ['E:2014'] } },
                {
                  nOf: [
                    7,
                    [
                      'EU%:D',
                      'LAF%:D',
                      'LAG%:D',
                      'AH2202:D',
                      'AH3204:D',
                      'AR2221:D',
                      'AR2222:D',
                      'AR2225:D',
                      'EC3371:D',
                      'EC3376:D',
                      'EC3377:D',
                      'EC4377:D',
                      'EL4200:D',
                      'EN2201:D',
                      'EN3266:D',
                      'EN3267:D',
                      'EN3268:D',
                      'EN4224:D',
                      'EN4271:D',
                      'HY2210:D',
                      'HY2249:D',
                      'HY2259:D',
                      'HY2262:D',
                      'HY4230:D',
                      'PH2206:D',
                      'PH2207:D',
                      'PH2222:D',
                      'PH3213:D',
                      'PH3222:D',
                      'PH4206:D',
                      'PH4207:D',
                      'PH4209:D',
                      'PH4210:D',
                      'PH4213:D',
                      'PH4261:D',
                      'PH4262:D',
                      'PS3258:D',
                      'PS3267:D',
                      'PS3880B:D',
                      'PS3880C:D',
                      'PS3880H:D',
                      'PS4201:D',
                      'PS4213:D',
                      'PS4217D:D',
                      'PS4217E:D',
                      'PS4217F:D',
                      'PS4231:D',
                      'PS4311:D',
                      'PS4882B:D',
                      'PS4883B:D',
                      'SC4213:D',
                      'TS2231:D',
                      'TS2239:D',
                      'TS3231:D',
                    ],
                  ],
                },
              ],
            },
            {
              and: [
                { cohort: { rule: 'MUST_BE_IN', years: ['S:2015'] } },
                {
                  nOf: [
                    7,
                    [
                      'EU%:D',
                      'LAF%:D',
                      'LAG%:D',
                      'LAS%:D',
                      'AH2202:D',
                      'AH3204:D',
                      'AR2221:D',
                      'AR2222:D',
                      'AR2225:D',
                      'EC3371:D',
                      'EC3376:D',
                      'EC3377:D',
                      'EC4377:D',
                      'EL4200:D',
                      'EN2201:D',
                      'EN3266:D',
                      'EN3267:D',
                      'EN3268:D',
                      'EN4224:D',
                      'EN4271:D',
                      'HY2210:D',
                      'HY2249:D',
                      'HY2259:D',
                      'HY2262:D',
                      'HY4230:D',
                      'PH2206:D',
                      'PH2207:D',
                      'PH2222:D',
                      'PH3213:D',
                      'PH3222:D',
                      'PH4206:D',
                      'PH4207:D',
                      'PH4209:D',
                      'PH4210:D',
                      'PH4213:D',
                      'PH4261:D',
                      'PH4262:D',
                      'PS3258:D',
                      'PS3267:D',
                      'PS3880B:D',
                      'PS3880C:D',
                      'PS3880H:D',
                      'PS4201:D',
                      'PS4213:D',
                      'PS4217D:D',
                      'PS4217E:D',
                      'PS4217F:D',
                      'PS4231:D',
                      'PS4311:D',
                      'PS4882B:D',
                      'PS4883B:D',
                      'SC4213:D',
                      'TS2231:D',
                      'TS2239:D',
                      'TS3231:D',
                    ],
                  ],
                },
              ],
            },
          ],
        },
        { cohort: { rule: 'MUST_BE_IN', years: ['S:2012'] } },
      ],
    };
    expect(
      parse(
        `
      PROGRAMME_TYPES IF_IN Undergraduate Degree
      THEN
      (
        UNITS (80)
        AND
        (
          MODULES (7) PH%:D,GET1029:D
          OR
          (
            COHORT_YEARS MUST_BE_IN E:2014
            AND
            MODULES (7) EU%:D,LAF%:D,LAG%:D,AH2202:D,AH3204:D,AR2221:D,AR2222:D,AR2225:D,EC3371:D,EC3376:D,EC3377:D,EC4377:D,EL4200:D,EN2201:D,EN3266:D,EN3267:D,EN3268:D,EN4224:D,EN4271:D,HY2210:D,HY2249:D,HY2259:D,HY2262:D,HY4230:D,PH2206:D,PH2207:D,PH2222:D,PH3213:D,PH3222:D,PH4206:D,PH4207:D,PH4209:D,PH4210:D,PH4213:D,PH4261:D,PH4262:D,PS3258:D,PS3267:D,PS3880B:D,PS3880C:D,PS3880H:D,PS4201:D,PS4213:D,PS4217D:D,PS4217E:D,PS4217F:D,PS4231:D,PS4311:D,PS4882B:D,PS4883B:D,SC4213:D,TS2231:D,TS2239:D,TS3231:D
          )
          OR
          (
            COHORT_YEARS MUST_BE_IN S:2015
            AND
            MODULES (7) EU%:D,LAF%:D,LAG%:D,LAS%:D,AH2202:D,AH3204:D,AR2221:D,AR2222:D,AR2225:D,EC3371:D,EC3376:D,EC3377:D,EC4377:D,EL4200:D,EN2201:D,EN3266:D,EN3267:D,EN3268:D,EN4224:D,EN4271:D,HY2210:D,HY2249:D,HY2259:D,HY2262:D,HY4230:D,PH2206:D,PH2207:D,PH2222:D,PH3213:D,PH3222:D,PH4206:D,PH4207:D,PH4209:D,PH4210:D,PH4213:D,PH4261:D,PH4262:D,PS3258:D,PS3267:D,PS3880B:D,PS3880C:D,PS3880H:D,PS4201:D,PS4213:D,PS4217D:D,PS4217E:D,PS4217F:D,PS4231:D,PS4311:D,PS4882B:D,PS4883B:D,SC4213:D,TS2231:D,TS2239:D,TS3231:D
          )
        )
        AND
        (
          (
            COHORT_YEARS MUST_BE_IN S:2012
            AND
            CAP (3.2)
          )
          OR
          SPECIAL MUST_BE_IN "ACAD_LEVEL=4"
        )
      )
      `,
      ),
    ).toEqual(result);
  });

  it('parses complex undergrad with multiple modules and subjects)', () => {
    const result: PrereqTree = {
      or: [
        'CH1%:D',
        'CL1%:D',
        'CH21%:D',
        'CL21%:D',
        'CH222%:D',
        'CH224%:D',
        'CH225%:D',
        'CH227%:D',
        'CH322%:D',
        'CH323%:D',
        'CH324%:D',
        'CH325%:D',
        'CH326%:D',
        'CH327%:D',
        'CH38%:D',
        'CL220%:D',
        'CL226%:D',
        'CL320%:D',
        'CL321%:D',
        'CL31%:D',
        'CL228%:D',
        'CL328%:D',
        'TRA%:D',
        'INT%:D',
      ],
    };
    expect(
      parse(
        `
      PROGRAMME_TYPES IF_IN Undergraduate Degree
      THEN
      (
        SUBJECTS (1) P111:6,21162:6,P1111:6,M1111:6,21111:6,PHC:6
        OR
        MODULES (1) CH1%:D,CL1%:D,CH21%:D,CL21%:D,CH222%:D,CH224%:D,CH225%:D,CH227%:D,CH322%:D,CH323%:D,CH324%:D,CH325%:D,CH326%:D,CH327%:D,CH38%:D,CL220%:D,CL226%:D,CL320%:D,CL321%:D,CL31%:D,CL228%:D,CL328%:D,TRA%:D,INT%:D
      )
      `,
      ),
    ).toEqual(result);
  });

  it('parses undergrad with special acad levels)', () => {
    const result: PrereqTree = { nOf: [7, ['NM%:D']] };
    expect(
      parse(
        `
      PROGRAMME_TYPES IF_IN Undergraduate Degree
      THEN
      (
        UNITS (80)
        AND
        MODULES (7) NM%:D
        AND
        (
          CAP (3.2)
          OR
          SPECIAL MUST_BE_IN "ACAD_LEVEL=4"
        )
      )
      `,
      ),
    ).toEqual(result);
  });

  it('parses undergrad with courses', () => {
    const result: PrereqTree = {
      or: [
        'YSC1212:D',
        'CS1010:D',
        'CS1010J:D',
        'CS1010E:D',
        'CS1010S:D',
        'CS1010FC:D',
        'CS1010X:D',
        'CS1101:D',
        'CS1101S:D',
      ],
    };
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\n(\n\tCOURSES (1) YSC1212:D,CS1010:D,CS1010J:D,CS1010E:D,CS1010S:D,CS1010FC:D,CS1010X:D,CS1101:D,CS1101S:D\n)
      `,
      ),
    ).toEqual(result);
  });

  it('parses undergrad and simplifies nested disjunctions of courses', () => {
    const result: PrereqTree = {
      or: [
        'AA%:D',
        'BB%:D',
        'CC%:D',
        'DD%:D',
        'EE%:D',
        'FF%:D',
        'GG%:D',
        'HH%:D',
        'II%:D',
        'JJ%:D',
      ],
    };
    expect(
      parse(
        `
        PROGRAMME_TYPES IF_IN Undergraduate Degree
        THEN
        (
          UNITS (80)
          AND
          MODULES (1) AA%:D,BB%:D,CC%:D
          OR
          (
            MODULES (1) DD%:D,EE%:D,FF%:D
            OR
            (
              MODULES (1) GG%:D,HH%:D,II%:D
              OR
              MODULES (1) JJ%:D
            )
          )
        )
      `,
      ),
    ).toEqual(result);
  });

  it('parses undergrad and simplifies nested conjunctions of courses', () => {
    const result: PrereqTree = {
      and: [
        {
          or: ['AA%:D', 'BB%:D', 'CC%:D'],
        },
        {
          or: ['DD%:D', 'EE%:D', 'FF%:D'],
        },
        {
          or: ['GG%:D', 'HH%:D', 'II%:D'],
        },
        'JJ%:D',
      ],
    };
    expect(
      parse(
        `
        PROGRAMME_TYPES IF_IN Undergraduate Degree
        THEN
        (
          UNITS (80)
          AND
          MODULES (1) AA%:D,BB%:D,CC%:D
          AND
          (
            MODULES (1) DD%:D,EE%:D,FF%:D
            AND
            (
              MODULES (1) GG%:D,HH%:D,II%:D
              AND
              MODULES (1) JJ%:D
            )
          )
        )
      `,
      ),
    ).toEqual(result);
  });
  it('parses binops with parentheses on both sides', () => {
    const result: PrereqTree = {
      and: [
        {
          or: ['FIN3102%:D', 'QF3101:D'],
        },
        {
          or: ['DSC2008:D', 'DSC1007%:D', 'CS1010:D', 'CS1101:D'],
        },
        { cohort: { rule: 'MUST_BE_IN', years: ['E:2016'] } },
      ],
    };
    expect(
      parse(
        `
PROGRAM_TYPES IF_IN Undergraduate Degree
THEN
(
        (
                (
                        (
                                PROGRAMS MUST_BE_IN (1) 0200ACCHON,0200BBAHON
                                AND
                                SPECIAL MUST_BE_IN "ACAD_LEVEL=4"
                        )
                )
                OR
                (
                        (
                                PROGRAMS MUST_BE_IN (1) 0200ACCHON,0200BBAHON
                                AND
                                SPECIAL MUST_BE_IN "ACAD_LEVEL=3"
                        )
                        AND
                        GPA (3.2)
                )
        )
        AND
        COURSES (1) FIN3102%:D,QF3101:D
        AND
        COURSES (1) DSC2008:D,DSC1007%:D,CS1010:D,CS1101:D
        AND
        COHORT_YEARS MUST_BE_IN E:2016
)
      `,
      ),
    ).toEqual(result);
  });
  it('keeps cohort years as a gating predicate', () => {
    const result: PrereqTree = {
      cohort: { rule: 'IF_IN', years: ['S:2022'] },
      then: {
        or: ['GEA1000N:D', 'ST1131:D', 'DSA1101:D', 'IE1111R:D', 'DSE1101:D', 'BT1101:D'],
      },
    };
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( COHORT_YEARS IF_IN S:2022 THEN COURSES (1) GEA1000N:D , ST1131:D , DSA1101:D , IE1111R:D , DSE1101:D , BT1101:D )
      `,
      ),
    ).toEqual(result);
  });

  it('gates trailing AND clauses under the cohort (the NGT2001E shape)', () => {
    // The consequence after THEN is greedy: the trailing "AND COURSES NSW%:D"
    // belongs inside the cohort gate, not as an ungated sibling requirement.
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COHORT_YEARS IF_IN S:2022 THEN COURSES NTW%:D, LC1016:D AND COURSES NSW%:D)
      `,
      ),
    ).toEqual({
      cohort: { rule: 'IF_IN', years: ['S:2022'] },
      then: { and: ['NTW%:D', 'LC1016:D', 'NSW%:D'] },
    });
  });

  // According to NUS docs, this means ALL courses are required.
  it('allows omitted courses count, keeping the cohort gate', () => {
    const result: PrereqTree = {
      cohort: { rule: 'IF_IN', years: ['S:2022'] },
      then: 'NTW%:D',
    };
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( COHORT_YEARS IF_IN S:2022 THEN COURSES NTW%:D )
      `,
      ),
    ).toEqual(result);
  });

  it('keeps an academic-year cohort range and IF_NOT_IN exclusions', () => {
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( COHORT_YEARS IF_IN S:2020/21 E:2022/23 THEN COURSES (1) CS1010:D )
      `,
      ),
    ).toEqual({
      cohort: { rule: 'IF_IN', years: ['S:2020/21', 'E:2022/23'] },
      then: 'CS1010:D',
    });

    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( COHORT_YEARS IF_NOT_IN E:2019 THEN COURSES (1) CS1010:D )
      `,
      ),
    ).toEqual({
      cohort: { rule: 'IF_NOT_IN', years: ['E:2019'] },
      then: 'CS1010:D',
    });
  });

  it('keeps a bare cohort constraint (no THEN) as an eligibility requirement', () => {
    // The cohort has no THEN subtree, so it is a bare constraint (the student
    // must be in the cohort) kept alongside the course requirement.
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( COURSES (1) CS1010:D AND COHORT_YEARS MUST_BE_IN E:2016 )
      `,
      ),
    ).toEqual({
      and: ['CS1010:D', { cohort: { rule: 'MUST_BE_IN', years: ['E:2016'] } }],
    });
  });

  it('keeps a bare cohort constraint ANDed with courses (the DBA3702 shape)', () => {
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (1) DAO1704%:D, DSC1007:D AND COHORT_YEARS MUST_BE_IN S:2017)
      `,
      ),
    ).toEqual({
      and: [
        { or: ['DAO1704%:D', 'DSC1007:D'] },
        { cohort: { rule: 'MUST_BE_IN', years: ['S:2017'] } },
      ],
    });
  });

  it('keeps a subject-year gate as a cohort-style predicate (the NHS2045 shape)', () => {
    // SUBJECT_YEARS shares COHORT_YEARS' S:/E: year-bound format, so it is
    // carried as a cohort-style gate evaluated against the matriculation year.
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN (SUBJECT_YEARS IF_IN S:2022/23 THEN COURSES NTW%:D)
        `,
      ),
    ).toEqual({
      cohort: { rule: 'IF_IN', years: ['S:2022/23'] },
      then: 'NTW%:D',
    });
  });

  it('keeps a two-year subject-year range gate (parallels the cohort range)', () => {
    // subject_years allows an optional second YEARS bound (S: ... E: ...), the
    // same closed-range syntax as cohort_years; both bounds must be preserved.
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN (SUBJECT_YEARS IF_IN S:2022/23 E:2023/24 THEN COURSES NTW%:D)
        `,
      ),
    ).toEqual({
      cohort: { rule: 'IF_IN', years: ['S:2022/23', 'E:2023/24'] },
      then: 'NTW%:D',
    });
  });

  it('keeps a bare subject-year constraint (no THEN) as an eligibility requirement', () => {
    // No current module presents a bare SUBJECT_YEARS, but it should be surfaced
    // as a cohort-style { cohort } node rather than silently dropped, mirroring
    // the bare COHORT_YEARS handling.
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( COURSES (1) CS1010:D AND SUBJECT_YEARS IF_IN S:2022/23 )
      `,
      ),
    ).toEqual({
      and: ['CS1010:D', { cohort: { rule: 'IF_IN', years: ['S:2022/23'] } }],
    });
  });

  // According to NUS docs, this means ALL subjects are required.
  // Also SPECIAL_PROGRAMME is undocumented by NUS, so best effort here...
  it('allows omitted subjects count an undocumented SPECIAL_PROGRAMME type', () => {
    const result: PrereqTree = '';
    expect(
      parse(
        `
          PROGRAM_TYPES IF_IN Undergraduate Degree THEN SUBJECTS EP:N AND SPECIAL_PROGRAMME MUST_BE_IN (1) 1501TMBSPL , 1502ANGSPL , 1503RC4SPL , 1503R4RSPL
        `,
      ),
    ).toEqual(result);
  });

  it('undocumented 2ND_MAJOR plan type', () => {
    const result: PrereqTree = {
      nOf: [
        9,
        [
          'YCC1111:CS',
          'YCC1113:CS',
          'YCC1121:CS',
          'YCC1131:C',
          'YCC1112:C',
          'YCC1114:C',
          'YCC2121:C',
          'YCC1122:CS',
          'YCC2137:C',
        ],
      ],
    };
    expect(
      parse(
        `
          PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (9) YCC1111:CS, YCC1113:CS, YCC1121:CS, YCC1131:C, YCC1112:C, YCC1114:C, YCC2121:C, YCC1122:CS, YCC2137:C AND 2ND_MAJOR MUST_BE_IN (1) 1700YLAHON)
        `,
      ),
    ).toEqual(result);
  });

  it('parses standalone courses', () => {
    const result: PrereqTree = {
      and: [
        'LSM2251:D',
        {
          or: ['LSM3272:D', 'ENV2101:D'],
        },
      ],
    };
    expect(
      parse(
        `
          COURSES LSM2251:D AND COURSES (1) LSM3272:D, ENV2101:D
        `,
      ),
    ).toEqual(result);
  });

  it('can parse bare program types with conjunction', () => {
    const result = '';
    expect(
      parse(
        `
        PROGRAM_TYPES MUST_BE_IN Undergraduate Degree AND COHORT_YEARS MUST_BE_IN S:2021 THEN (PROGRAMS MUST_BE_IN 1003QFNHON AND SPECIAL MUST_BE_IN "ACAD_LEVEL=3-4")
        `,
      ),
    ).toEqual(result);
  });

  // A gate that names several program types is a real restriction (only the
  // lone "Undergraduate Degree" wrapper is dropped as assumed), so it is kept
  // and labelled with the union of its types.
  it('keeps and labels a multi-type program-type gate', () => {
    const result = {
      programType: {
        rule: 'IF_IN',
        types: ['Undergraduate Degree', 'Graduate Degree Research', 'Graduate Degree Coursework'],
      },
      then: { or: ['PL3102:D', 'PL3232:D'] },
    };
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree, Graduate Degree Research, Graduate Degree Coursework THEN (COURSES (1) PL3102:D, PL3232:D)
        `,
      ),
    ).toEqual(result);
  });

  // Differing program types are modelled as gates (IF CPE: x, OR IF postgrad: y).
  // The planner has no program-type input, so these are carried for display only.
  it('models differing program-type branches (alternate degree)', () => {
    expect(
      parse(
        `
          (PROGRAM_TYPES IF_IN CPE (Certificate) THEN (COURSES (1) IT5003:D)) OR (PROGRAM_TYPES IF_IN Graduate Degree Coursework THEN COURSES (1) IT5003:D)
        `,
      ),
    ).toEqual({
      or: [
        { programType: { rule: 'IF_IN', types: ['CPE (Certificate)'] }, then: 'IT5003:D' },
        { programType: { rule: 'IF_IN', types: ['Graduate Degree Coursework'] }, then: 'IT5003:D' },
      ],
    });
  });

  // The ESE5608 shape: the undergraduate branch is entirely PROGRAMS + SPECIAL
  // constraints (which the tree cannot represent), so it collapses away. Only
  // the graduate branch survives, and being non-undergraduate it keeps its label
  // rather than being dropped as an assumed wrapper.
  it('keeps a graduate survivor when the undergraduate branch is unrepresentable', () => {
    expect(
      parse(
        `
          (PROGRAM_TYPES IF_IN Graduate Degree Coursework THEN (COURSES (1) ESE5003:D)) OR (PROGRAM_TYPES IF_IN Undergraduate Degree THEN PROGRAMS MUST_BE_IN (1) 0613EVEHON AND SPECIAL MUST_BE_IN "ACAD_LEVEL=4")
        `,
      ),
    ).toEqual({
      programType: { rule: 'IF_IN', types: ['Graduate Degree Coursework'] },
      then: 'ESE5003:D',
    });
  });

  // A gate that is a disjunction of program types — `IF_IN X OR IF_IN Y` — is
  // collapsed into one IF_IN over the union of types. The EE6438 shape:
  // parenthesised, graduate-only, so the gate is kept and labelled.
  it('collapses a parenthesised OR-of-program-types gate (the EE6438 shape)', () => {
    expect(
      parse(
        `
          (PROGRAM_TYPES IF_IN Graduate Degree Coursework OR PROGRAM_TYPES IF_IN Graduate Degree Research) THEN (COURSES (1) EE5431:D, EE5431R:D, EE5433R:D, EE5441:D)
        `,
      ),
    ).toEqual({
      programType: {
        rule: 'IF_IN',
        types: ['Graduate Degree Coursework', 'Graduate Degree Research'],
      },
      then: { or: ['EE5431:D', 'EE5431R:D', 'EE5433R:D', 'EE5441:D'] },
    });
  });

  // The BL5232D shape: an unparenthesised OR-of-program-types gate.
  it('collapses an unparenthesised OR-of-program-types gate (the BL5232D shape)', () => {
    expect(
      parse(
        `
          PROGRAM_TYPES IF_IN Graduate Degree Research OR PROGRAM_TYPES IF_IN Graduate Degree Coursework THEN COURSES BL5232:D
        `,
      ),
    ).toEqual({
      programType: {
        rule: 'IF_IN',
        types: ['Graduate Degree Research', 'Graduate Degree Coursework'],
      },
      then: 'BL5232:D',
    });
  });

  // The EE5113 shape: an OR-gate that names undergraduates alongside another
  // program type is a real restriction (not the lone undergraduate wrapper), so
  // it is kept and labelled with the union of types.
  it('keeps an OR-of-program-types gate that includes undergraduates', () => {
    expect(
      parse(
        `
          (PROGRAM_TYPES IF_IN Undergraduate Degree OR PROGRAM_TYPES IF_IN Graduate Degree Coursework) THEN COURSES EE5934:D
        `,
      ),
    ).toEqual({
      programType: {
        rule: 'IF_IN',
        types: ['Undergraduate Degree', 'Graduate Degree Coursework'],
      },
      then: 'EE5934:D',
    });
  });

  it('models a clean two-branch differing program-type prereq', () => {
    expect(
      parse(
        `
          (PROGRAM_TYPES IF_IN Undergraduate Degree THEN COURSES (1) A1234:D) OR (PROGRAM_TYPES IF_IN Graduate Degree Coursework THEN COURSES (1) B1234:D)
        `,
      ),
    ).toEqual({
      or: [
        { programType: { rule: 'IF_IN', types: ['Undergraduate Degree'] }, then: 'A1234:D' },
        { programType: { rule: 'IF_IN', types: ['Graduate Degree Coursework'] }, then: 'B1234:D' },
      ],
    });
  });

  // Same program type on both branches: the gate is uniform, so it is flattened
  // away and the consequences are OR-ed directly (no program-type nodes remain).
  it('flattens same-type program-type branches (the honours shape)', () => {
    expect(
      parse(
        `
          PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (1) A1234:D) OR PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (1) B1234:D)
        `,
      ),
    ).toEqual({ or: ['A1234:D', 'B1234:D'] });
  });

  // The outermost (assumed) Undergraduate wrapper is dropped, hoisting its
  // courses to the top, while the differing Graduate branch is kept as a gate.
  it('drops the outer wrapper but keeps a differing nested program-type gate', () => {
    expect(
      parse(
        `
          PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES IE2100 OR COURSES IE2110) OR PROGRAM_TYPES IF_IN Graduate Degree Coursework THEN (COURSES IE5001 OR COURSES IE5004)
        `,
      ),
    ).toEqual({
      or: [
        'IE2100',
        'IE2110',
        {
          programType: { rule: 'IF_IN', types: ['Graduate Degree Coursework'] },
          then: { or: ['IE5001', 'IE5004'] },
        },
      ],
    });
  });

  // A real honours module: same program type, complex cohort/units/gpa/special
  // branches. The uniform gate flattens, leaving a symmetric disjunction.
  it('parses a complex same-program-type honours module', () => {
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( UNITS (80) AND COHORT_YEARS MUST_BE_IN E:2019/20 AND COURSES (7) SE%:D OR COURSES (7) PS%:D OR COURSES (7) GL%:D AND GPA (3.2) OR SPECIAL MUST_BE_IN "ACAD_LEVEL=4" ) OR PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( UNITS (80) AND COHORT_YEARS MUST_BE_IN S:2020/21 E:2020/21 AND COURSES (7) SE%:D OR COURSES (7) PS%:D AND GPA (3.2) OR SPECIAL MUST_BE_IN "ACAD_LEVEL=4" )
        `,
      ),
    ).toMatchSnapshot();
  });

  it('cannot parse invalid stuff', () => {
    const result = null;
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN
          ((UNITS (80) AND GPA (3.2)) OR SPECIAL MUST_BE_IN "ACAD_LEVEL=4")
          AND ((COHORT_YEARS MUST_BE_IN E:2019 AND (COURSES (7) PS1%:D, PS2%:D, PS3%:D, PS4%:D OR COURSES (7) GL%:D))
          OR (COHORT_YEARS MUST_BE_IN S:2020 AND COHORT_YEARS MUST_BE_IN E:2020 (COURSES (7) PS1%:D, PS2%:D, PS3%:D, PS4%:D)))
        `,
      ),
    ).toEqual(result);
  });
});
