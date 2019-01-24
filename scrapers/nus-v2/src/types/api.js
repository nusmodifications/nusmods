// @flow

export type AcademicGroup = {|
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
  WorkLoadHours: string,
  EffectiveDate: string,
  CourseId: string,
  CourseOfferNumber: string,
  Preclusion: string,
  AcademicGroup: ModuleAcademicGroup,
  CatalogPrint: string,
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
  room: string,
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
