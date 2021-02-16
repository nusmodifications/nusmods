/**
 * Shape of the raw data from the API. These are subsequently mapped
 * to the intermediate types in mapper.js and transformed to the final
 * types used in modules.js
 */

/* eslint-disable camelcase */

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

// Possible CourseAttribute values. CourseAttributeValue is usually 'YES' or 'NO'.
// YEAR - Year-Long Module
// UROP - Undergraduate Research Opportunities Programme
// SSGF - SkillsFuture Funded
// SFS - SkillsFuture Series
// PRQY - Has NUS Prereq and can SU
// PRQN - Has NUS Prereq and cannot SU
// NPRY - Without NUS Prereq and can SU
// NPRN - Without NUS Prereq & cannot SU
// LABB - LAB Based
// ISM - Independent Study Module
// HFYP - Honours/Final Year Project (value is 'HT', not 'YES' like the other attributes)
// GRDY - GD modules eligible for SU
// MPE - Module is included in a particular semester's MPE. Value is 'S1' (sem 1), 'S2', or 'S1&2' (both sem 1 and 2)
export type ModuleAttributeEntry = Readonly<{
  CourseAttributeValue: string;
  CourseAttribute: string;
}>;

export type ModuleInfo = Readonly<{
  Term: string;
  AcademicOrganisation: ModuleAcademicOrganisation;
  AcademicGroup: ModuleAcademicGroup;
  WorkLoadHours: string;
  EffectiveDate: string;
  CourseId: string; // Internal ID used to connect dual-coded modules
  CourseOfferNumber: string; // Usually 1, can be 2 or more for dual-coded modules
  Preclusion: string;

  PrintCatalog: 'Y' | 'N';
  YearLong: 'Y' | 'N';

  CourseTitle: string;
  CoRequisite: string;
  Description: string;
  ModularCredit: string;
  PreRequisite: string;
  Subject: string; // The letter prefix part of the module code
  CatalogNumber: string; // The number and suffix part of the module code

  ModuleAttributes?: ModuleAttributeEntry[];
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
