import { map } from 'lodash-es';
import { Lesson, SemTimetableConfig, SemTimetableConfigWithLessons } from 'types/timetables';
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
      Tutorial: [
        '8|MON|1600|1700|AS6-0208|3_4_5_6_7_8_9_10_11_12_13',
        '9|MON|1700|1800|AS6-0208|3_4_5_6_7_8_9_10_11_12_13',
      ],
      Recitation: ['4|THU|1700|1800|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
    },
  };

  const configWithLessons: SemTimetableConfigWithLessons<Lesson> = hydrateSemTimetableWithLessons(
    config,
    modulesMap,
    sem,
  );
  expect(new Set(map(configWithLessons[moduleCode].Tutorial, 'classNo'))).toEqual(
    new Set(['8', '9']),
  );
  expect(new Set(map(configWithLessons[moduleCode].Recitation, 'classNo'))).toEqual(new Set(['4']));
  expect(new Set(map(configWithLessons[moduleCode].Lecture, 'classNo'))).toEqual(new Set(['1']));
});
