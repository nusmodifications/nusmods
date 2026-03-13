/**
 * Shape of the raw data from the API. These are subsequently mapped
 * to the intermediate types in mapper.js and transformed to the final
 * types used in modules.js
 */

// AcademicGrp and AcademicOrg use abbreviation to avoid clashing with the
// name of the field when destructuring
export type AcademicGrp = Readonly<{
  AcademicGroup: string;
  Description: string;
  DescriptionShort: string;
  EffectiveDate: string;
  EffectiveStatus: string;
}>;

export type AcademicOrg = Readonly<{
  AcademicOrganisation: string;
  Description: string;
  DescriptionShort: string;
  EffectiveDate: string;
  EffectiveStatus: string;
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
  CourseAttribute: string;
  CourseAttributeValue: string;
}>;

export type ModuleInfo = Readonly<{
  AcademicGroup: string;
  AcademicGroupDesc: string;
  AdditionalInformation: string | null;
  ApplicableFromSem: string;
  ApplicableFromYear: string;
  CatalogNumber: string;
  Code: string;
  CorequisiteRule: string | null;
  CorequisiteSummary: string | null;
  CourseAttributes: Array<{ Code: string; Value: string }>;
  CourseDesc: string;
  CourseOfferNumber: string;
  EduRecCourseID: string | null;
  EffectiveDate: string | null;
  GradingBasisDesc: string | null;
  OrganisationCode: string;
  OrganisationName: string;
  PreclusionRule: string | null;
  PreclusionSummary: string | null;
  PreRequisiteAdvisory: string | null;
  PrerequisiteRule: string | null;
  PrerequisiteSummary: string | null;
  SubjectArea: string;
  Title: string;
  UnitsMax: number | null;
  UnitsMin: number | null;
  WorkloadHoursNUSMods: string | null;
  YearLong: 'Y' | 'N';
  // TODO: Investigate why PrintCatalog was removed from the API response
  // PrintCatalog: 'Y' | 'N';
}>;

export type TimetableLesson = Readonly<{
  activity: string;
  csize: number;
  day: string;
  deptfac: string;
  end_time: string;
  eventdate: string;
  modgrp: string;
  module: string;
  numweeks: number;
  room: string | null;
  session: string;
  start_time: string;
  term: string;
}>;

export type ModuleExam = Readonly<{
  acad_org: string;
  duration: number;
  end_time: string;
  exam_date: string;
  module: string;
  start_time: string;
  term: string;
}>;
