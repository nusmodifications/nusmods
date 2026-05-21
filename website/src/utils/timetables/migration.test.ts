import { TaModulesConfigV1, ModuleLessonConfigV1 } from 'types/timetables';

import { getModuleTimetable } from 'utils/modules';

import { CS1010S } from '__mocks__/modules';
import { migrateModuleLessonConfig } from './migration';

describe('v1 config migration', () => {
  const moduleLessonConfig = {
    Lecture: '1',
  };
  const moduleTimetable = getModuleTimetable(CS1010S, 1);
  test('should do nothing if already migrated', () => {
    const migrationResult = migrateModuleLessonConfig(
      {
        Lecture: [0],
      },
      [],
      'CS1010S',
      moduleTimetable,
    );
    expect(migrationResult).toEqual({
      migratedModuleLessonConfig: {
        Lecture: [0],
      },
      alreadyMigrated: true,
    });
  });

  test('should not error if ta module config was migrated but module lesson config was not', () => {
    const migrationResult = migrateModuleLessonConfig(
      moduleLessonConfig,
      [],
      'CS1010S',
      moduleTimetable,
    );
    expect(migrationResult).toEqual({
      migratedModuleLessonConfig: {
        Lecture: [0],
      },
      alreadyMigrated: false,
    });
  });

  test('should error if migration is missing data to migrate from the old config', () => {
    const taModuleConfig = {
      CS1010S: [['Lecture', '1']],
    } as TaModulesConfigV1;
    expect(() =>
      migrateModuleLessonConfig(moduleLessonConfig, taModuleConfig, 'CS1010S', []),
    ).toThrow(Error('Lesson indices missing'));
  });

  test('should error if migration cannot find the lesson indices for non-ta module classNo', () => {
    const invalidModuleLessonConfig = {
      Lecture: '2',
    } as ModuleLessonConfigV1;
    expect(() =>
      migrateModuleLessonConfig(
        invalidModuleLessonConfig,
        {
          CS1010S: [],
        },
        'CS1010S',
        moduleTimetable,
      ),
    ).toThrow(Error('Lesson indices missing'));
  });

  test('should error if migration cannot find the lesson indices for ta module classNo', () => {
    const taModuleConfig = {
      CS1010S: [
        ['Lecture', '1'],
        ['Lecture', '2'],
      ],
    } as TaModulesConfigV1;
    expect(() =>
      migrateModuleLessonConfig(moduleLessonConfig, taModuleConfig, 'CS1010S', moduleTimetable),
    ).toThrow(Error('Lesson indices missing'));
  });
});
