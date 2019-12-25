export type WeekType =
  | 'Instructional'
  | 'Reading'
  | 'Examination'
  | 'Recess'
  | 'Vacation'
  | 'Orientation';

export type Semester = 'Semester 1' | 'Semester 2' | 'Special Term I' | 'Special Term II';

export interface AcadYear {
  year: string;
  startDate: Date;
}

export interface AcadWeek {
  weekType: WeekType;
  weekNumber: number | null;
}

export interface AcadWeekInfo {
  year: string;
  sem: Semester | null;
  type: WeekType | null;
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
