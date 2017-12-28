import {
  convertTimeToIndex,
  convertIndexToTime,
  getTimeRange,
  getAllDays,
  getSchoolDays,
  getWeekdays,
} from './timify';

describe('convertTimeToIndex', () => {
  it('should convert time string to index', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const doubleDigitTime = `0${hour % 24}`.slice(-2);
      expect(convertTimeToIndex(`${doubleDigitTime}00`)).toBe(hour * 2);
      expect(convertTimeToIndex(`${doubleDigitTime}30`)).toBe((hour * 2) + 1);
    }
  });

  it('should convert non-half hour string to index', () => {
    const actual = convertTimeToIndex('2359');
    const expected = 48;
    expect(actual).toBe(expected);
  });
});

describe('convertIndexToTime', () => {
  it('should convert time index to string', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const doubleDigitTime = `0${hour % 24}`.slice(-2);
      expect(convertIndexToTime(hour * 2)).toBe(`${doubleDigitTime}00`);
      expect(convertIndexToTime((hour * 2) + 1)).toBe(`${doubleDigitTime}30`);
    }
  });
});

describe('getTimeRange', () => {
  it('should convert time range to array in intervals of 30', () => {
    expect(getTimeRange('0900', '1000')).toEqual(['0900', '0930']);
  });

  it('should convert time range with strings after 1200', () => {
    expect(getTimeRange('1300', '1330')).toEqual(['1300']);
  });
});

describe('getAllDays', () => {
  it('should get array of only school days', () => {
    const schoolDays = getAllDays();
    expect(schoolDays).toHaveLength(7);
    expect(schoolDays).toMatchSnapshot();
  });
});

describe('getSchoolDays', () => {
  it('should get array of only school days', () => {
    const schoolDays = getSchoolDays();
    expect(schoolDays).toHaveLength(6);
    expect(schoolDays).toMatchSnapshot();
  });
});

describe('getWeekdays', () => {
  it('should get array of only weekdays', () => {
    expect(getWeekdays()).toMatchSnapshot();
  });
});
