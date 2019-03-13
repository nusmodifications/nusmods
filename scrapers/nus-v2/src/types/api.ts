/**
 * Shape of the raw data from the API. These are subsequently mapped
 * to the intermediate types in mapper.js and transformed to the final
 * types used in modules.js
 */

// AcademicGrp and AcademicOrg use abbreviation to avoid clashing with the
// name of the field when destructuring
export type AcademicGrp = Readonly<{
  EffectiveStatus: string;
  AcademicGroup: string;
  DescriptionShort: string;
  Description: string;
  EffectiveDate: string;
}>;

export type AcademicOrg = Readonly<{
  EffectiveStatus: string;
  DescriptionShort: string;
  Description: string;
  EffectiveDate: string;
  AcademicOrganisation: string;
}>;

export type ModuleAcademicOrganisation = Readonly<{
  Code: string;
  Description: string;
}>;

export type ModuleAcademicGroup = Readonly<{
  Code: string;
  Description: string;
}>;

export type ModuleInfo = Readonly<{
  Term: string;
  AcademicOrganisation: ModuleAcademicOrganisation;
  AcademicGroup: ModuleAcademicGroup;
  WorkLoadHours: string;
  EffectiveDate: string;
  CourseId: string;
  CourseOfferNumber: string;
  Preclusion: string;

  PrintCatalog: 'Y' | 'N';
  YearLong: 'Y' | 'N';

  CourseTitle: string;
  CoRequisite: string;
  CatalogNumber: string;
  Description: string;
  ModularCredit: string;
  PreRequisite: string;
  Subject: string;

  // I'm not sure what this is used for
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModuleAttributes: any;
}>;

export type TimetableLesson = Readonly<{
  term: string;
  room: string | null;
  numweeks: number;
  start_time: string;
  activity: string;
  csize: number;
  module: string;
  eventdate: string;
  session: string;
  end_time: string;
  modgrp: string;
  deptfac: string;
  day: string;
}>;

export type ModuleExam = Readonly<{
  term: string;
  start_time: string;
  acad_org: string;
  module: string;
  end_time: string;
  duration: number;
  exam_date: string;
}>;
