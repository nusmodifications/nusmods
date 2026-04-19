import { SemTimetableConfig, SemTimetableConfigWithLessons } from 'types/timetables';
import { Semester } from 'types/modules';
import { ModulesMap } from 'types/reducers';

import { CS1010S } from '__mocks__/modules';

import { hydrateSemTimetableWithLessons } from './lessonHydration';

test('hydrateSemTimetableWithLessons should replace ClassNo with lessons', () => {
  const sem: Semester = 1;
  const moduleCode = 'CS1010S';
  const modulesMap: ModulesMap = { [moduleCode]: CS1010S };
  const config: SemTimetableConfig = {
    [moduleCode]: {
      Tutorial: [42, 43],
      Recitation: [5],
      Lecture: [0],
    },
  };

  const configWithLessons: SemTimetableConfigWithLessons = hydrateSemTimetableWithLessons(
    config,
    modulesMap,
    sem,
  );
  expect(configWithLessons[moduleCode].Tutorial[0].classNo).toBe('8');
  expect(configWithLessons[moduleCode].Tutorial[1].classNo).toBe('9');
  expect(configWithLessons[moduleCode].Recitation[0].classNo).toBe('4');
  expect(configWithLessons[moduleCode].Lecture[0].classNo).toBe('1');
});
