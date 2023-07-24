import parseString from './parseString';
import { mockLogger } from '../../utils/test-utils';
import { PrereqTree } from '../../types/modules';

/* eslint-disable max-len */

// integration tests, normalize + parse
const logger = mockLogger();
const parse = (string: string) => parseString(string, logger);

describe(parseString, () => {
  it('parses basic undergrad modules)', () => {
    const result: PrereqTree = 'BMF5322';
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
      or: [
        { nOf: [7, ['PH%:D', 'GET1029:D']] },
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
        "YSC1212:D",
        "CS1010:D",
        "CS1010J:D",
        "CS1010E:D",
        "CS1010S:D",
        "CS1010FC:D",
        "CS1010X:D",
        "CS1101:D",
        "CS1101S:D",
      ]
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
        "AA%:D",
        "BB%:D",
        "CC%:D",
        "DD%:D",
        "EE%:D",
        "FF%:D",
        "GG%:D",
        "HH%:D",
        "II%:D",
        "JJ%:D",
      ]
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
          or: [
            "AA%:D",
            "BB%:D",
            "CC%:D",
          ]
        },
        {
          or: [
            "DD%:D",
            "EE%:D",
            "FF%:D",
          ]
        },
        {
          or: [
            "GG%:D",
            "HH%:D",
            "II%:D",
          ]
        },
        "JJ%:D",
      ]
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
          or: [
            "FIN3102%:D",
            "QF3101:D",
          ]
        },
        {
          or: [
            "DSC2008:D",
            "DSC1007%:D",
            "CS1010:D",
            "CS1101:D",
          ]
        },
      ]
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
  it('allows cohort years as predicate (optional)', () => {
    const result: PrereqTree = {
      or: [
        "GEA1000N:D",
        "ST1131:D",
        "DSA1101:D",
        "IE1111R:D",
        "DSE1101:D",
        "BT1101:D"
      ]
    };
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( COHORT_YEARS IF_IN S:2022 THEN COURSES (1) GEA1000N:D , ST1131:D , DSA1101:D , IE1111R:D , DSE1101:D , BT1101:D )
      `,
      ),
    ).toEqual(result);
  });

  // According to NUS docs, this means ALL courses are required.
  it('allows omitted courses count', () => {
    const result: PrereqTree = "NTW%:D";
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( COHORT_YEARS IF_IN S:2022 THEN COURSES NTW%:D )
      `,
      ),
    ).toEqual(result);
  });

  // According to NUS docs, this means ALL subjects are required.
  // Also SPECIAL_PROGRAMME is undocumented by NUS, so best effort here...
  it('allows omitted subjects count an undocumented SPECIAL_PROGRAMME type', () => {
    const result: PrereqTree = "";
    expect(
      parse(
        `
          PROGRAM_TYPES IF_IN Undergraduate Degree THEN SUBJECTS EP:N AND SPECIAL_PROGRAMME MUST_BE_IN (1) 1501TMBSPL , 1502ANGSPL , 1503RC4SPL , 1503R4RSPL
        `,
      ),
    ).toEqual(result);
  });

  it('undocumented 2ND_MAJOR plan type', () => {
    const result: PrereqTree = { "nOf": [9, ["YCC1111:CS", "YCC1113:CS", "YCC1121:CS", "YCC1131:C", "YCC1112:C", "YCC1114:C", "YCC2121:C", "YCC1122:CS", "YCC2137:C"]] };
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
      "and": [
        "LSM2251:D",
        {
          or: [
            "LSM3272:D",
            "ENV2101:D",
          ]
        }
      ]
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
    const result = ""
    expect(
      parse(
        `
        PROGRAM_TYPES MUST_BE_IN Undergraduate Degree AND COHORT_YEARS MUST_BE_IN S:2021 THEN (PROGRAMS MUST_BE_IN 1003QFNHON AND SPECIAL MUST_BE_IN "ACAD_LEVEL=3-4")
        `
      ),
    ).toEqual(result);
  });

  it('can parse multiple program types in one PROGRAM_TYPE', () => {
    const result = {
      or: [
        "PL3102:D",
        "PL3232:D",
      ]
    }
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree, Graduate Degree Research, Graduate Degree Coursework THEN (COURSES (1) PL3102:D, PL3232:D)
        `
      ),
    ).toEqual(result);
  })

  // Too complex, this says IF CPE degree then xyz course, else IF postgrad then abc course.
  it('cannot parse alternate degree', () => {
    const result = null
    expect(
      parse(
        `
          (PROGRAM_TYPES IF_IN CPE (Certificate) THEN (COURSES (1) IT5003:D)) OR (PROGRAM_TYPES IF_IN Graduate Degree Coursework THEN COURSES (1) IT5003:D)
        `
      ),
    ).toEqual(result);
  });

  it('cannot parse alternate program types', () => {
    const result = null
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( UNITS (80) AND COHORT_YEARS MUST_BE_IN E:2019/20 AND COURSES (7) SE%:D OR COURSES (7) PS%:D OR COURSES (7) GL%:D AND GPA (3.2) OR SPECIAL MUST_BE_IN "ACAD_LEVEL=4" ) OR PROGRAM_TYPES IF_IN Undergraduate Degree THEN ( UNITS (80) AND COHORT_YEARS MUST_BE_IN S:2020/21 E:2020/21 AND COURSES (7) SE%:D OR COURSES (7) PS%:D AND GPA (3.2) OR SPECIAL MUST_BE_IN "ACAD_LEVEL=4" )
        `
      ),
    ).toEqual(result);
  })

  it('cannot parse invalid stuff', () => {
    const result = null
    expect(
      parse(
        `
        PROGRAM_TYPES IF_IN Undergraduate Degree THEN
          ((UNITS (80) AND GPA (3.2)) OR SPECIAL MUST_BE_IN "ACAD_LEVEL=4")
          AND ((COHORT_YEARS MUST_BE_IN E:2019 AND (COURSES (7) PS1%:D, PS2%:D, PS3%:D, PS4%:D OR COURSES (7) GL%:D))
          OR (COHORT_YEARS MUST_BE_IN S:2020 AND COHORT_YEARS MUST_BE_IN E:2020 (COURSES (7) PS1%:D, PS2%:D, PS3%:D, PS4%:D)))
        `
      ),
    ).toEqual(result);
  })


});
