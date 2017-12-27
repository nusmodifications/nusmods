// @flow

import { parseQueryString } from './migrateTimetable';

describe('parseQueryString', () => {
  test('should parse lessons from v2 query string', () => {
    expect(
      parseQueryString(
        'CS4243[LAB]=4&CS4243[LEC]=1&CS2105[LEC]=1&CS2105[TUT]=8&GER1000[TUT]=E09&CS5331=',
      ),
    ).toEqual({
      CS4243: {
        Laboratory: '4',
        Lecture: '1',
      },
      CS2105: {
        Lecture: '1',
        Tutorial: '8',
      },
      GER1000: {
        Tutorial: 'E09',
      },
      CS5331: {},
    });

    expect(
      parseQueryString('GEH1067[LEC]=1&GEH1067[TUT]=E1&CS3235[LEC]=1&CS3235[TUT]=4&CS5331[LEC]=1'),
    ).toEqual({
      GEH1067: {
        Lecture: '1',
        Tutorial: 'E1',
      },
      CS3235: {
        Lecture: '1',
        Tutorial: '4',
      },
      CS5331: {
        Lecture: '1',
      },
    });

    expect(parseQueryString('')).toEqual({});
  });
});
