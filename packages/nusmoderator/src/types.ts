/**
 * The type of an academic week.
 */
export type WeekType =
  | 'Instructional'
  | 'Reading'
  | 'Examination'
  | 'Recess'
  | 'Vacation'
  | 'Orientation';

/**
 * One of the four NUS semesters.
 */
export type Semester = 'Semester 1' | 'Semester 2' | 'Special Term I' | 'Special Term II';

/**
 * An academic year.
 */
export interface AcadYear {
  /**
   * Short string name of an academic year, e.g.  "AY2020/2021" → "20/21".
   */
  year: string;

  /**
   * Date of the the first weekday of Week 0 of this academic year.
   */
  startDate: Date;
}

/**
 * An academic week.
 */
export interface AcadWeek {
  /**
   * Type of this academic week.
   */
  weekType: WeekType;

  /**
   * This `AcadWeek` is the `weekNumber`-th week with this academic week type
   * in the semester. `null` if the semester has exactly 1 week of this type.
   * Examples below:
   *
   * - Instructional week 1: `weekNumber` = 1
   * - Instructional week 13: `weekNumber` = 13
   * - Examination week 2: `weekNumber` = 2
   * - Examination week 2: `weekNumber` = 2
   * - Recess week: `weekNumber` = `null`, since there's only 1 recess week in
   *   the semester.
   */
  weekNumber: number | null;
}

/**
 * Encapsulates information about an academic week.
 */
export interface AcadWeekInfo {
  /**
   * Short string name of the academic year this week is in.
   *
   * E.g. "AY2020/2021" → "20/21".
   */
  year: string;

  /**
   * Semester that this academic week is in.
   */
  sem: Semester | null;

  /**
   * Type of this academic week.
   */
  type: WeekType | null;

  /**
   * This `AcadWeek` is the `weekNumber`-th week with this academic week type
   * in the semester. `null` if the semester has exactly 1 week of this type.
   * Examples below:
   *
   * - Instructional week 1: `weekNumber` = 1
   * - Instructional week 13: `weekNumber` = 13
   * - Examination week 2: `weekNumber` = 2
   * - Examination week 2: `weekNumber` = 2
   * - Recess week: `weekNumber` = `null`, since there's only 1 recess week in
   *   the semester.
   * - Orientation week: `weekNumber` = `null`
   * - Vacation week 3: `weekNumber` = 3
   * - Vacation week `null`: a vacation week's `weekNumber` can be null in very
   *   rare cases.
   *
   * @see getAcadWeekInfo
   */
  num: number | null;
}

declare class AcademicCalendar {
  getAcadYearStartDate(acadYear: string): Date;
  getAcadYear(date: Date): AcadYear;
  getAcadSem(weekNumber: number): string;
  getAcadWeekName(weekNumber: number): AcadWeek;
  getAcadWeekInfo(date: Date): AcadWeekInfo;
  getExamWeek(year: string, semester: number): Date;
}

export default class NUSModerator {
  static academicCalendar: AcademicCalendar;
}
