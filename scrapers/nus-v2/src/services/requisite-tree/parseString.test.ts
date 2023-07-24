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
});
