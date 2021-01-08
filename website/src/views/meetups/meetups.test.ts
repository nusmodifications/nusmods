import * as Meetups from './meetups';

describe('generateTimetableDay', () => {
  it('Should be of length specified in timetableDayLength setting', () => {
    const timetableDay = Meetups.generateTimetableDay();
    expect(timetableDay.length).toBe(Meetups.timetableDayLength);
  });

  it('Should not be pointing to the same array', () => {
    const timetableDay1 = Meetups.generateTimetableDay();
    const timetableDay2 = Meetups.generateTimetableDay();
    expect(timetableDay1).toEqual(timetableDay2);
    expect(timetableDay1).not.toBe(timetableDay2);
    expect(timetableDay1).not.toBe(Meetups.defaultTimetableDay);
  });
});

describe('generateUser', () => {
  it('Should have name color specified in defaultUserSettings setting', () => {
    const user = Meetups.generateUser();
    const excludedObjectKeys = ['timetable'];
    const objectKeys = Object.keys(user).filter(
      (key) => excludedObjectKeys.includes(key) === false,
    ) as (keyof Meetups.UserSettings)[];
    objectKeys.forEach((key) => {
      expect(user[key]).toBe(Meetups.defaultUserSettings[key]);
    });
  });
});

describe('mapTimetableDayToStartEndTuples', () => {
  it.only('Converts a timetableDay array into an array of start-end tuples', () => {
    const timetableDay = Meetups.generateTimetableDay();
    [1, 2, 3, 6, 7, 8, 9, 13, 14, 18].forEach((index) => {
      timetableDay[index] = Meetups.switchTimetableDayValue(timetableDay[index]);
    });
    const startEndTuples = Meetups.mapTimetableDayToStartEndTuples(timetableDay);
    expect(startEndTuples).toEqual([
      [1, 4],
      [6, 10],
      [13, 15],
      [18, 19],
    ]);
  });
});
