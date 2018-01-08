// @flow

import migrateLegacyStorage from 'storage/migrateLegacyStorage';

/* eslint-disable no-useless-computed-key */
test('return empty state there was no original data', () => {
  expect(migrateLegacyStorage(undefined)).toEqual(undefined);
});

test('update legacy settings state', () => {
  const migrated = migrateLegacyStorage({
    settings: {},
  });

  expect(migrated).toHaveProperty('settings.corsNotification');
});

test('move timetables state', () => {
  const migrated = migrateLegacyStorage({
    timetables: {
      [1]: {
        CS3216: {
          Lecture: '1',
        },
        CS1010S: {
          Lecture: '1',
          Recitation: '2',
        },
      },
      [2]: {
        CS1010S: { Lecture: '1' },
        CS3217: { Lecture: '2' },
      },
    },

    theme: {
      colors: {
        CS3217: 0,
        CS1010S: 1,
        CS3216: 2,
      },
    },
  });

  expect(migrated).toHaveProperty('timetables', {
    lessons: {
      [1]: {
        CS3216: {
          Lecture: '1',
        },
        CS1010S: {
          Lecture: '1',
          Recitation: '2',
        },
      },
      [2]: {
        CS1010S: { Lecture: '1' },
        CS3217: { Lecture: '2' },
      },
    },
    colors: {
      [1]: {
        CS1010S: 1,
        CS3216: 2,
      },
      [2]: {
        CS3217: 0,
        CS1010S: 1,
      },
    },
    academicYear: '2017/2018',
  });
});

test('fill incomplete color maps', () => {
  expect(
    migrateLegacyStorage({
      timetables: {
        [1]: {
          CS3216: {
            Lecture: '1',
          },
          CS1010S: {
            Lecture: '1',
            Recitation: '2',
          },
        },
        [2]: {
          CS1010S: { Lecture: '1' },
          CS3217: { Lecture: '2' },
        },
      },

      theme: {
        colors: {
          CS1010S: 1,
        },
      },
    }),
  ).toHaveProperty('timetables.colors', {
    [1]: {
      CS1010S: 1,
      CS3216: 0,
    },
    [2]: {
      CS1010S: 1,
      CS3217: 0,
    },
  });

  expect(
    migrateLegacyStorage({
      timetables: {
        [1]: {
          CS3216: {
            Lecture: '1',
          },
          CS1010S: {
            Lecture: '1',
            Recitation: '2',
          },
        },
        [2]: {
          CS1010S: { Lecture: '1' },
          CS3217: { Lecture: '2' },
        },
      },
      theme: {},
    }),
  ).toHaveProperty('timetables.colors', {
    [1]: {
      CS1010S: expect.any(Number),
      CS3216: expect.any(Number),
    },
    [2]: {
      CS1010S: expect.any(Number),
      CS3217: expect.any(Number),
    },
  });
});
