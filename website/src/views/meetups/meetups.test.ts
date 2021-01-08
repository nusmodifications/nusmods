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
  it('Converts a timetableDay array into an array of start-end tuples', () => {
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

describe('mapDetailsToModifiableLessons', () => {
  it('Converts a name, color and startEndTuple into a ModifiableLesson', () => {
    const modifiableLesson = Meetups.mapDetailsToModifiableLessons(
      Meetups.defaultUserSettings.name,
      Meetups.defaultUserSettings.color,
      [
        [1, 2],
        [13, 15],
      ],
    );
    expect(modifiableLesson).toEqual([
      {
        ...Meetups.defaultModifiableLesson,
        moduleCode: Meetups.defaultUserSettings.name,
        colorIndex: Meetups.defaultUserSettings.color,
        startTime: '0100',
        endTime: '0200',
      },
      {
        ...Meetups.defaultModifiableLesson,
        moduleCode: Meetups.defaultUserSettings.name,
        colorIndex: Meetups.defaultUserSettings.color,
        startTime: '1300',
        endTime: '1500',
      },
    ]);
  });
});

describe('seralizeTimetable', () => {
  it('Converts timetable into a string for sharing', () => {
    const timetable = Meetups.generateTimetable();
    Object.keys(timetable).forEach((days) => {
      const day = days as Meetups.Days;
      const timetableDay = timetable[day];
      [1, 2, 3, 6, 7, 8, 9, 13, 14, 18].forEach((index) => {
        timetableDay[index] = Meetups.switchTimetableDayValue(timetableDay[index]);
      });
    });
    const url = Meetups.seralizeTimetable(timetable);
    expect(url).toEqual('MEETUPS=4IMG0;4IMG0;4IMG0;4IMG0;4IMG0;4IMG0;4IMG0');
  });
});

describe('deseralizeTimetable', () => {
  it('Converts serialized string into timetable', () => {
    const timetable = Meetups.generateTimetable();
    Object.keys(timetable).forEach((days) => {
      const day = days as Meetups.Days;
      const timetableDay = timetable[day];
      [1, 2, 3, 6, 7, 8, 9, 13, 14, 18].forEach((index) => {
        timetableDay[index] = Meetups.switchTimetableDayValue(timetableDay[index]);
      });
    });
    const deseralizedTimetable = Meetups.deserializeTimetable(
      'MEETUPS=4IMG0;4IMG0;4IMG0;4IMG0;4IMG0;4IMG0;4IMG0',
    );
    expect(deseralizedTimetable).toMatchObject(timetable);
  });
});

describe('generateColor', () => {
  it('Generates a color number from 0 to 7', () => {
    const color : Meetups.Color = Meetups.generateColor(Math.floor(Math.random() * 100))
    expect(color).toBeGreaterThanOrEqual(0)
    expect(color).toBeLessThanOrEqual(7)
  })
})
