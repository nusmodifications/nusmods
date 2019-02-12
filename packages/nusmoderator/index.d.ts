export type WeekType =
  | 'Instructional'
  | 'Reading'
  | 'Examination'
  | 'Recess'
  | 'Vacation'
  | 'Orientation';

export type Semester = 'Semester 1' | 'Semester 2' | 'Special Sem 1' | 'Special Sem 2';

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
  sem: Semester;
  type: WeekType;
  num?: number;
}

declare class AcademicCalendar {
  getAcadYear(date: Date): AcadYear;
  getAcadSem(weekNumber: number): string;
  getAcadWeekName(weekNumber: number): AcadWeek;
  getAcadWeekInfo(date: Date): AcadWeekInfo;
  getExamWeek(year: string, semester: number): Date;
}

export default class NUSModerator {
  static academicCalendar: AcademicCalendar;
}
