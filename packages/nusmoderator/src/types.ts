export type WeekType =
  | 'Instructional'
  | 'Reading'
  | 'Examination'
  | 'Recess'
  | 'Vacation'
  | 'Orientation';

export type Semester = 'Semester 1' | 'Semester 2' | 'Special Term I' | 'Special Term II';

export interface AcadYear {
  startDate: Date;
  year: string;
}

export interface AcadWeek {
  weekNumber: number | null;
  weekType: WeekType;
}

export interface AcadWeekInfo {
  num: number | null;
  sem: Semester | null;
  type: WeekType | null;
  year: string;
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
