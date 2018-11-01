// flow-typed signature: d6c2d56759bcac47e659b9ecf2eaf144
// flow-typed version: <<STUB>>/nusmoderator_v2.1.1/flow_v0.69.0

declare module 'nusmoderator' {
  declare type AcadWeekInfo = {
    year: string,
    sem: 'Semester 1' | 'Semester 2' | 'Special Sem 1' | 'Special Sem 2',
    type: 'Instructional' | 'Reading' | 'Examination' | 'Recess' | 'Vacation' | 'Orientation',
    num: ?number,
  };

  declare type AcademicCalendar = {
    getAcadYear: (date: Date) => { year: string, startDate: Date },
    getAcadSem: (acadWeekNumber: number) => string,
    getAcadWeekName: (acadWeekNumber: number) => string,
    getAcadWeekInfo: (date: Date) => AcadWeekInfo,
    getExamWeek: (year: string, semester: number) => Date,
  };

  declare module.exports: {
    academicCalendar: AcademicCalendar,
  };
}
