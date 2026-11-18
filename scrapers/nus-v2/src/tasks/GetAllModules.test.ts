import { ModuleInfo } from '../types/api';
import { compareModuleVersion, deduplicateModulesByVersion } from './GetAllModules';

/**
 * Build a minimal ModuleInfo for a given catalog revision. Only the fields that
 * deduplication relies on are meaningful; the rest are filled with placeholders.
 */
function makeModule(overrides: Partial<ModuleInfo>): ModuleInfo {
  return {
    AcademicGroup: '',
    AcademicGroupDesc: '',
    AdditionalInformation: null,
    ApplicableFromSem: '1',
    ApplicableFromYear: '2026',
    BaseVersionMajor: 0,
    BaseVersionMinor: 0,
    CatalogNumber: '2002',
    Code: 'ES2002',
    CorequisiteRule: null,
    CorequisiteSummary: null,
    CourseAttributes: [],
    CourseDesc: '',
    CourseOfferNumber: '1',
    EduRecCourseID: null,
    EffectiveDate: null,
    GradingBasisDesc: null,
    OrganisationCode: '',
    OrganisationName: '',
    PreclusionRule: null,
    PreclusionSummary: null,
    PreRequisiteAdvisory: null,
    PrerequisiteRule: null,
    PrerequisiteSummary: null,
    SubjectArea: 'ES',
    Title: 'Business Communication for Leaders (BBA)',
    UnitsMax: 4,
    UnitsMin: 4,
    VersionMajor: 0,
    VersionMinor: 0,
    WorkloadHoursNUSMods: null,
    YearLong: 'N',
    ...overrides,
  };
}

describe(compareModuleVersion, () => {
  test('ranks by major version first', () => {
    const older = makeModule({ VersionMajor: 4, VersionMinor: 9 });
    const newer = makeModule({ VersionMajor: 5, VersionMinor: 0 });
    expect(compareModuleVersion(newer, older)).toBeGreaterThan(0);
    expect(compareModuleVersion(older, newer)).toBeLessThan(0);
  });

  test('ranks by minor version when major ties', () => {
    const older = makeModule({ VersionMajor: 4, VersionMinor: 1 });
    const newer = makeModule({ VersionMajor: 4, VersionMinor: 2 });
    expect(compareModuleVersion(newer, older)).toBeGreaterThan(0);
  });

  test('tie-breaks on EffectiveDate when versions are equal', () => {
    const older = makeModule({
      EffectiveDate: '2023-08-07 00:00:00',
      VersionMajor: 2,
      VersionMinor: 0,
    });
    const newer = makeModule({
      EffectiveDate: '2024-01-15 00:00:00',
      VersionMajor: 2,
      VersionMinor: 0,
    });
    expect(compareModuleVersion(newer, older)).toBeGreaterThan(0);
  });

  test('returns 0 when indistinguishable', () => {
    const a = makeModule({ EffectiveDate: '2020-01-01', VersionMajor: 1, VersionMinor: 0 });
    const b = makeModule({ EffectiveDate: '2020-01-01', VersionMajor: 1, VersionMinor: 0 });
    expect(compareModuleVersion(a, b)).toBe(0);
  });
});

describe(deduplicateModulesByVersion, () => {
  test('keeps the highest-version revision of a duplicated module code', () => {
    // Mirrors the real ES2002 data: three revisions in array order, with the
    // stale legacy revision (v1.2, missing preclusions) appearing last - which
    // the old array-order/keyBy behaviour would have wrongly selected.
    const modules = [
      makeModule({
        AcademicGroup: 'NUS',
        PreclusionSummary: 'CS2101/ES2007D/IS2101/MNO2706/NTW%',
        VersionMajor: 4,
        VersionMinor: 2,
      }),
      makeModule({
        AcademicGroup: '034',
        PreclusionSummary: 'CS2101/ES2007D/IS2101/MNO2706/NTW%',
        VersionMajor: 5,
        VersionMinor: 0,
      }),
      makeModule({
        AcademicGroup: '099',
        PreclusionSummary: 'ES2007D, IS2101, MNO2706',
        VersionMajor: 1,
        VersionMinor: 2,
      }),
    ];

    const result = deduplicateModulesByVersion(modules);

    expect(result).toHaveLength(1);
    expect(result[0].VersionMajor).toBe(5);
    expect(result[0].AcademicGroup).toBe('034');
    expect(result[0].PreclusionSummary).toContain('NTW%');
  });

  test('leaves distinct module codes untouched', () => {
    const modules = [
      makeModule({ CatalogNumber: '2100', SubjectArea: 'CS', VersionMajor: 1 }),
      makeModule({ CatalogNumber: '2105', SubjectArea: 'CS', VersionMajor: 1 }),
    ];

    const result = deduplicateModulesByVersion(modules);

    expect(result).toHaveLength(2);
  });

  test('keeps the last-seen entry when revisions are indistinguishable', () => {
    // Tie on version and date resolves to iteration order: the per-semester
    // fallback flattens semesters ascending, so the later semester wins,
    // matching the "latest semester's data is canonical" convention.
    const modules = [
      makeModule({ AcademicGroup: 'earlier-semester', VersionMajor: 1, VersionMinor: 0 }),
      makeModule({ AcademicGroup: 'later-semester', VersionMajor: 1, VersionMinor: 0 }),
    ];

    const result = deduplicateModulesByVersion(modules);

    expect(result).toHaveLength(1);
    expect(result[0].AcademicGroup).toBe('later-semester');
  });
});
