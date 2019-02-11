declare module 'nusmoderator' {
  type WeekType =
    | 'Instructional'
    | 'Reading'
    | 'Examination'
    | 'Recess'
    | 'Vacation'
    | 'Orientation';
  type Semester = 'Semester 1' | 'Semester 2' | 'Special Sem 1' | 'Special Sem 2';

  interface AcadYear {
    year: string;
    startDate: Date;
  }

  interface AcadWeek {
    weekType: WeekType;
    weekNumber: number | null;
  }

  interface AcadWeekInfo {
    year: string;
    sem: Semester;
    type: WeekType;
    num: number;
  }

  class AcademicCalendar {
    getAcadYear(date: Date): AcadYear;
    getAcadSem(weekNumber: number): string;
    getAcadWeekName(weekNumber: number): AcadWeek;
    getAcadWeekInfo(date: Date): AcadWeekInfo;
    getExamWeek(year: string, semester: number): Date;
  }

  class NUSModerator {
    static academicCalendar: AcademicCalendar;
  }

  export = NUSModerator;
}
