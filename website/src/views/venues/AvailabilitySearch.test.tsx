import { defaultSearchOptions } from 'views/venues/AvailabilitySearch';

describe(defaultSearchOptions, () => {
  test('should the nearest slots during school hours', () => {
    // Monday
    expect(defaultSearchOptions(new Date('2018-01-15T12:30:00'))).toMatchObject({
      time: 12,
      day: 0,
    });

    // Saturday
    expect(defaultSearchOptions(new Date('2018-01-20T08:12:00'))).toMatchObject({
      time: 8,
      day: 5,
    });
  });

  test("should set time to something within school hours if we're outside it", () => {
    // 6am - before school starts
    expect(defaultSearchOptions(new Date('2018-01-15T06:12:00'))).toMatchObject({
      time: 8,
      day: 0,
    });

    // 1am - after school ends
    expect(defaultSearchOptions(new Date('2018-01-16T01:12:00'))).toMatchObject({
      time: 8,
      day: 1,
    });

    // Sunday
    expect(defaultSearchOptions(new Date('2018-01-21T09:12:00'))).toMatchObject({
      time: 9,
      day: 0,
    });
  });
});
