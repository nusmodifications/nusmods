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
