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
  Code: string;
  Title: string;
  OrganisationCode: string;
  OrganisationName: string;
  AcademicGroup: string;
  AcademicGroupDesc: string;
  UnitsMin: number;
  UnitsMax: number;
  CourseDesc: string;
  PreRequisiteAdvisory: string;
  PrerequisiteSummary: string;
  PrerequisiteRule: string;
  CorequisiteSummary: string;
  CorequisiteRule: string;
  PreclusionSummary: string;
  PreclusionRule: string;
  CourseAttributes: { Code: string; Value: string }[];
  YearLong: 'Y' | 'N';
  EffectiveDate: string;
  SubjectArea: string;
  CatalogNumber: string;
  WorkloadHoursNUSMods: string | null;
  CourseOfferNumber: string;
  ApplicableFromYear: string;
  ApplicableFromSem: string;
  PrintCatalog: 'Y' | 'N'; // Not in doc but likely there
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
