// @flow

/**
 * Shape of the raw data from the API. These are subsequently mapped
 * to the intermediate types in mapper.js and transformed to the final
 * types used in modules.js
 */

// AcademicGrp and AcademicOrg use abbreviation to avoid clashing with the
// name of the field when destructuring
export type AcademicGrp = {|
  +EffectiveStatus: string,
  +AcademicGroup: string,
  +DescriptionShort: string,
  +Description: string,
  +EffectiveDate: string,
|};

export type AcademicOrg = {|
  +EffectiveStatus: string,
  +DescriptionShort: string,
  +Description: string,
  +EffectiveDate: string,
  +AcademicOrganisation: string,
|};

export type ModuleAcademicOrganisation = {|
  +Code: string,
  +Description: string,
|};

export type ModuleAcademicGroup = {|
  +Code: string,
  +Description: string,
|};

export type ModuleInfo = {|
  Term: string,
  AcademicOrganisation: ModuleAcademicOrganisation,
  AcademicGroup: ModuleAcademicGroup,
  WorkLoadHours: string,
  EffectiveDate: string,
  CourseId: string,
  CourseOfferNumber: string,
  Preclusion: string,

  // Some system uses PrintCatalog, others use CatalogPrint
  PrintCatalog?: string,
  CatalogPrint?: string,

  CourseTitle: string,
  YearLong: string,
  CoRequisite: string,
  CatalogNumber: string,
  Description: string,
  ModularCredit: string,
  PreRequisite: string,
  Subject: string,
|};

export type TimetableLesson = {|
  term: string,
  room: ?string,
  numweeks: number,
  start_time: string,
  activity: string,
  csize: number,
  module: string,
  eventdate: string,
  session: string,
  end_time: string,
  modgrp: string,
  deptfac: string,
  day: string,
|};

export type ModuleExam = {|
  term: string,
  start_time: string,
  acad_org: string,
  module: string,
  end_time: string,
  duration: number,
  exam_date: string,
|};
