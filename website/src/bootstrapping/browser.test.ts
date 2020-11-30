import { browserlistToBowser } from './browser';

/* eslint-disable camelcase */

describe(browserlistToBowser, () => {
  it('should return a mapping to the lowest version in the list', () => {
    expect(
      browserlistToBowser([
        'firefox 57',
        'firefox 58',
        'firefox 59',
        'chrome 60',
        'chrome 59',
        'chrome 58',
      ]),
    ).toMatchObject({
      firefox: '>=57',
      chrome: '>=58',
    });
  });

  it('should return map Samsung Internet browser and iOS Safari correctly', () => {
    expect(browserlistToBowser(['samsung 8', 'ios_saf 10.1', 'safari 9', 'safari 10'])).toEqual({
      mobile: {
        samsung_internet: '>=8',
        safari: '>=10.1',
      },
      tablet: {
        samsung_internet: '>=8',
        safari: '>=10.1',
      },
      desktop: {
        safari: '>=9',
      },
    });
  });

  it('should return correct mapping for version ranges', () => {
    expect(browserlistToBowser(['chrome 10.1-10.2', 'chrome 9.0-9.2'])).toMatchObject({
      chrome: '>=9',
    });

    expect(browserlistToBowser(['ios_saf 10.1-10.2', 'ios_saf 9.0-9.2'])).toMatchObject({
      mobile: { safari: '>=9' },
      tablet: { safari: '>=9' },
    });
  });
});
