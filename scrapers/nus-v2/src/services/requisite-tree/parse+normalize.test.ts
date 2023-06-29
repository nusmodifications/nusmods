import parseString from './parseString';
import { mockLogger } from '../../utils/test-utils';
import { PrereqTree } from 'types/modules';

/* eslint-disable max-len */

// integration tests, normalize + parse
const logger = mockLogger();
const parse = (string: string) => parseString(string, logger);

describe(parseString, () => {
  it('parses basic undergrad modules)', () => {
    const result: PrereqTree = "BMF5322";
    expect(parse(
      `
        PROGRAMME_TYPES IF_IN Graduate Degree Coursework
        THEN
        (
          MODULES (1) BMF5322
        )
      `
    )).toEqual(result);
  });

  it('parses basic undergrad with multiple modules)', () => {
    const result: PrereqTree = {"nOf": [1, ["PH2110:D", "GEM2006:D", "GET1028:D"]]};
    expect(parse(
      `
      PROGRAMME_TYPES IF_IN Undergraduate Degree
      THEN
      (
        MODULES (1) PH2110:D,GEM2006:D,GET1028:D
      )
      `
    )).toEqual(result);
  });

  it('parses complex undergrad with multiple modules and simplifies tree)', () => {
    const result: PrereqTree = {"or": [
      {"nOf": [7, ["PH%:D", "GET1029:D"]]},
      {"or": [
        {
          "nOf": [7, ["EU%:D", "LAF%:D", "LAG%:D", "AH2202:D", "AH3204:D", "AR2221:D", "AR2222:D", "AR2225:D", "EC3371:D", "EC3376:D", "EC3377:D", "EC4377:D", "EL4200:D", "EN2201:D", "EN3266:D", "EN3267:D", "EN3268:D", "EN4224:D", "EN4271:D", "HY2210:D", "HY2249:D", "HY2259:D", "HY2262:D", "HY4230:D", "PH2206:D", "PH2207:D", "PH2222:D", "PH3213:D", "PH3222:D", "PH4206:D", "PH4207:D", "PH4209:D", "PH4210:D", "PH4213:D", "PH4261:D", "PH4262:D", "PS3258:D", "PS3267:D", "PS3880B:D", "PS3880C:D", "PS3880H:D", "PS4201:D", "PS4213:D", "PS4217D:D", "PS4217E:D", "PS4217F:D", "PS4231:D", "PS4311:D", "PS4882B:D", "PS4883B:D", "SC4213:D", "TS2231:D", "TS2239:D", "TS3231:D"]]
        },
        {
          "nOf": [7, ["EU%:D", "LAF%:D", "LAG%:D", "LAS%:D", "AH2202:D", "AH3204:D", "AR2221:D", "AR2222:D", "AR2225:D", "EC3371:D", "EC3376:D", "EC3377:D", "EC4377:D", "EL4200:D", "EN2201:D", "EN3266:D", "EN3267:D", "EN3268:D", "EN4224:D", "EN4271:D", "HY2210:D", "HY2249:D", "HY2259:D", "HY2262:D", "HY4230:D", "PH2206:D", "PH2207:D", "PH2222:D", "PH3213:D", "PH3222:D", "PH4206:D", "PH4207:D", "PH4209:D", "PH4210:D", "PH4213:D", "PH4261:D", "PH4262:D", "PS3258:D", "PS3267:D", "PS3880B:D", "PS3880C:D", "PS3880H:D", "PS4201:D", "PS4213:D", "PS4217D:D", "PS4217E:D", "PS4217F:D", "PS4231:D", "PS4311:D", "PS4882B:D", "PS4883B:D", "SC4213:D", "TS2231:D", "TS2239:D", "TS3231:D"]]
        }
      ]}
    ]};
    expect(parse(
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
      `
    )).toEqual(result);
  });

  it('parses complex undergrad with multiple modules and subjects)', () => {
    const result: PrereqTree = {"nOf": [1,
      ["CH1%:D", "CL1%:D", "CH21%:D", "CL21%:D", "CH222%:D", "CH224%:D", "CH225%:D", "CH227%:D", "CH322%:D", "CH323%:D", "CH324%:D", "CH325%:D", "CH326%:D", "CH327%:D", "CH38%:D", "CL220%:D", "CL226%:D", "CL320%:D", "CL321%:D", "CL31%:D", "CL228%:D", "CL328%:D", "TRA%:D", "INT%:D"]
    ]};
    expect(parse(
      `
      PROGRAMME_TYPES IF_IN Undergraduate Degree
      THEN
      (
        SUBJECTS (1) P111:6,21162:6,P1111:6,M1111:6,21111:6,PHC:6
        OR
        MODULES (1) CH1%:D,CL1%:D,CH21%:D,CL21%:D,CH222%:D,CH224%:D,CH225%:D,CH227%:D,CH322%:D,CH323%:D,CH324%:D,CH325%:D,CH326%:D,CH327%:D,CH38%:D,CL220%:D,CL226%:D,CL320%:D,CL321%:D,CL31%:D,CL228%:D,CL328%:D,TRA%:D,INT%:D
      )
      `
    )).toEqual(result);
  });

  it('parses undergrad with special acad levels)', () => {
    const result: PrereqTree = {"nOf": [7,
      ["NM%:D"]
    ]};
    expect(parse(
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
      `
    )).toEqual(result);
  });

});
