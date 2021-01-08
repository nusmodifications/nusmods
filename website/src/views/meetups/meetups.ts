import _ from 'lodash';
import { ModifiableLesson, TimetableArrangement } from 'types/timetables';

// SETTINGS ==========
export const timetableDayLength = 24;
const defaultTimetableDayValue: TimetableDayValue = 0;
export const defaultUserSettings: UserSettings = {
  color: 0,
  name: 'Myself',
};
export const defaultModifiableLesson: ModifiableLessonSettings = {
  classNo: '',
  day: '',
  lessonType: '',
  venue: '',
  weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  title: '',
};
// ===================

export type State = Readonly<{
  user: User;
  others: User[];
}>;

type User = Readonly<{
  color: Color;
  name: string;
  timetable: Timetable;
}>;
type Color = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type UserSettings = Drop<User, 'timetable'>;

type Timetable = Readonly<{
  Monday: TimetableDay;
  Tuesday: TimetableDay;
  Wednesday: TimetableDay;
  Thursday: TimetableDay;
  Friday: TimetableDay;
  Saturday: TimetableDay;
  Sunday: TimetableDay;
}>;

type Days = keyof Timetable;
// const days: Days[] = [
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
//   'Sunday',
// ];

// type TimetableDayIndex = Range<0, typeof timetableDayLength>;
type TimetableDayValue = 0 | 1;
type TimetableDay = TimetableDayValue[];
export const defaultTimetableDay: TimetableDay = new Array<TimetableDayValue>(
  timetableDayLength,
).fill(defaultTimetableDayValue);

export function switchTimetableDayValue(currentValue: TimetableDayValue): TimetableDayValue {
  return currentValue === 0 ? 1 : 0;
}

export function generateTimetableDay(): TimetableDay {
  return [...defaultTimetableDay];
}

export function generateTimetable(): Timetable {
  return {
    Monday: generateTimetableDay(),
    Tuesday: generateTimetableDay(),
    Wednesday: generateTimetableDay(),
    Thursday: generateTimetableDay(),
    Friday: generateTimetableDay(),
    Saturday: generateTimetableDay(),
    Sunday: generateTimetableDay(),
  };
}

export function generateUser(settings: UserSettings = defaultUserSettings): User {
  return {
    ...settings,
    timetable: generateTimetable(),
  };
}

export function generateState(): State {
  return {
    user: generateUser(),
    others: [generateUser()],
  };
}

type StartEndTuple = [number, number];
export function mapTimetableDayToStartEndTuples(timetableDay: TimetableDay): StartEndTuple[] {
  return timetableDay.reduce<StartEndTuple[]>((accumulator, currentValue, index) => {
    if (currentValue === 1) {
      const previousTuple = accumulator.pop();
      if (previousTuple == null) return [[index, index + 1]];
      if (previousTuple[1] === index) return [...accumulator, [previousTuple[0], index + 1]];
      return [...accumulator, previousTuple, [index, index + 1]];
    }
    return accumulator;
  }, []);
}

type ModifiableLessonSettings = Readonly<
  Drop<ModifiableLesson, 'moduleCode' | 'startTime' | 'endTime' | 'colorIndex'>
>;
export function mapDetailsToModifiableLessons(
  name: string,
  color: Color,
  startEndTuples: StartEndTuple[],
): ModifiableLesson[] {
  function convertTimetableDayIndexToTimeString(timetableDayIndex: number): string {
    if (timetableDayIndex < 0)
      throw new Error(`Invalid timetableDayIndex ${timetableDayIndex} encountered.`);
    if (timetableDayIndex < 10) return `0${timetableDayIndex.toString()}00`;
    return `${timetableDayIndex.toString()}00`;
  }
  return startEndTuples.map((tuple) => ({
    ...defaultModifiableLesson,
    moduleCode: name,
    colorIndex: color,
    startTime: convertTimetableDayIndexToTimeString(tuple[0]),
    endTime: convertTimetableDayIndexToTimeString(tuple[1]),
  }));
}

export function mapModifiableLessonsToStartEndTuples(
  modifiableLessons: ModifiableLesson[],
): StartEndTuple[] {
  function convertTimeStringToTimetableDayIndex(timeString: string): number {
    return parseInt(timeString.slice(0, 2));
  }
  return modifiableLessons.map((modifiableLesson) => [
    convertTimeStringToTimetableDayIndex(modifiableLesson.startTime),
    convertTimeStringToTimetableDayIndex(modifiableLesson.endTime),
  ]);
}

export function mapUserToTimetableArrangement(user: User): TimetableArrangement {
  const { name, color, timetable } = user;
  const transform = (timetableDay: TimetableDay) =>
    mapDetailsToModifiableLessons(name, color, mapTimetableDayToStartEndTuples(timetableDay));
  return _.mapValues(timetable, (value) => [transform(value)]);
}

export function combineTimetableArrangements(
  user: TimetableArrangement,
  others: TimetableArrangement[],
): TimetableArrangement {
  return _.mapValues(user, (value, key) => [value[0], ...others.map((person) => person[key][0])]);
}

function updateTimetableDayFromStartEndTuples(
  timetableDay: TimetableDay,
  startEndTuples: StartEndTuple[],
): TimetableDay {
  startEndTuples.forEach((tuple) => {
    for (let index = tuple[0]; index < tuple[1]; index++) {
      timetableDay[index] = 1;
    }
  });
  return timetableDay;
}

export function handleImportFromTimetable(lessons: TimetableArrangement): (state: State) => State {
  const startEndTuples = _.mapValues(lessons, (day: ModifiableLesson[][]) =>
    day
      .map(mapModifiableLessonsToStartEndTuples)
      .reduce<StartEndTuple[]>((accumulator, current) => accumulator.concat(current), []),
  );

  const final: { [x: string]: StartEndTuple[] } = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
    ...startEndTuples,
  };

  return (state) => {
    return {
      ...state,
      user: {
        ...state.user,
        timetable: _.mapValues(state.user.timetable, (value, key) => {
          console.log(key);
          return updateTimetableDayFromStartEndTuples(value, final[key]);
        }),
      },
    };
  };
}

// HELPER TYPE FUNCTIONS ==========

type Drop<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
// type PrependNextNum<A extends Array<unknown>> = A['length'] extends infer T
//   ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
//     ? X
//     : never
//   : never;
// type EnumerateInternal<A extends Array<unknown>, N extends number> = {
//   0: A;
//   1: EnumerateInternal<PrependNextNum<A>, N>;
// }[N extends A['length'] ? 0 : 1];
// type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[] ? E : never;
// type Range<FROM extends number, TO extends number> = Exclude<Enumerate<TO>, Enumerate<FROM>>;
