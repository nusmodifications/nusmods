// SETTINGS ==========
export const timetableDayLength = 24;
const defaultTimetableDayValue: TimetableDayValue = 0;
export const defaultUserSettings: UserSettings = {
  color: 0,
  name: 'Myself',
};
// ===================

export type State = Readonly<{
  user: User;
  others: User[];
}>;

type User = Readonly<{
  color: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  name: string;
  timetable: Timetable;
}>;

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

// type Days = keyof Timetable;
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
    others: [],
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
