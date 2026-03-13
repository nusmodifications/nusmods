import { strict as assert } from 'node:assert';
import { each, fromPairs, keyBy, isEmpty } from 'lodash';

import type { AcademicGrp, AcademicOrg, ModuleAttributeEntry, ModuleInfo } from '../types/api';
import type {
  DepartmentCodeMap,
  FacultyCodeMap,
  SemesterModule,
  SemesterModuleData,
  WritableSemesterModuleData,
} from '../types/mapper';
import type { NUSModuleAttributes, RawLesson, Semester, Workload } from '../types/modules';
import type { CovidZoneId } from '../services/getCovidZones';
import { Task } from '../types/tasks';
import { Cache } from '../types/persist';

import config from '../config';
import BaseTask from './BaseTask';
import GetSemesterExams from './GetSemesterExams';
import GetSemesterTimetable from './GetSemesterTimetable';
import { validateSemester } from '../services/validation';
import { removeEmptyValues, titleize, trimValues, findEquivalentModules } from '../utils/data';
import { difference } from '../utils/set';
import { Logger } from '../services/logger';

interface Input {
  departments: Array<AcademicOrg>;
  faculties: Array<AcademicGrp>;
  modules: Array<ModuleInfo>;
  /** Pre-fetched timetables for this semester. If provided, skips internal timetable fetch. */
  timetables?: { [moduleCode: string]: Array<RawLesson> };
  /** Module codes that have timetable data in any semester. Used to avoid propagating
   *  timetable data to modules that are genuinely offered in other semesters. */
  modulesWithAnyTimetable?: Set<string>;
}

type Output = Array<SemesterModuleData>;

/**
 * Create a mapping of department code to department name from a list of faculties
 */
export const getDepartmentCodeMap = (departments: Array<AcademicOrg>): DepartmentCodeMap =>
  fromPairs(
    departments.map((department) => [department.AcademicOrganisation, department.Description]),
  );

export const getFacultyCodeMap = (departments: Array<AcademicGrp>): FacultyCodeMap =>
  fromPairs(departments.map((faculty) => [faculty.AcademicGroup, faculty.Description]));

const attributeMap: { [attribute: string]: keyof NUSModuleAttributes } = {
  GRDY: 'grsu',
  HFYP: 'fyp',
  ISM: 'ism',
  LABB: 'lab',
  NPRY: 'su',
  PRQY: 'su',
  SFS: 'sfs',
  SSGF: 'ssgf',
  UROP: 'urop',
  YEAR: 'year',
  // MPE handled separately as it maps to multiple attributes
};

// Known truthy values for course attributes
const truthyValues = new Set(['Yes', 'YES', 'HT - Honours Thesis/Rsh Project', 'HT']);

// Known falsy values for course attributes
const falsyValues = new Set(['No', 'NO']);

// MPE value → attribute keys mapping
const mpeValueMap: { [value: string]: Array<keyof NUSModuleAttributes> } = {
  S1: ['mpes1'],
  'S1 - Sem 1': ['mpes1'],
  'S1&S2': ['mpes1', 'mpes2'],
  'S1&S2 - Sem 1 & 2': ['mpes1', 'mpes2'],
  S2: ['mpes2'],
  'S2 - Sem 2': ['mpes2'],
};

// Known SFS subcategory values that indicate the module is in SkillsFuture
// Series. The API changed from returning "YES"/"NO" to returning specific
// subcategory codes.
const sfsTruthyValues = new Set([
  'YES',
  'DA',
  'DA - Data Analytics',
  'AM',
  'AM - Advanced Manufacturing',
  'US',
  'US - Urban Solutions',
  'FIN',
  'FIN - Finance',
  'CS',
  'CS - Cybersecurity',
  'ENT',
  'ENT - Entrepreneurship',
  'TES',
  'TES - Tech-Enabled Services',
  'DM',
  'DM - Digital Media',
]);

export function mapAttributes(
  attributes: Array<ModuleAttributeEntry>,
  logger: Logger,
): NUSModuleAttributes | undefined {
  const nusAttributes: NUSModuleAttributes = {};

  for (const entry of attributes) {
    if (entry.CourseAttribute === 'MPE') {
      const mappedAttributes = mpeValueMap[entry.CourseAttributeValue];
      if (!mappedAttributes) {
        logger.warn(
          { key: entry.CourseAttribute, value: entry.CourseAttributeValue },
          'Non-standard course attribute value',
        );
      } else {
        for (const attr of mappedAttributes) {
          nusAttributes[attr] = true;
        }
      }
      continue;
    }

    if (!attributeMap[entry.CourseAttribute]) {
      continue;
    }

    // SFS uses specific subcategory values instead of YES/NO
    if (entry.CourseAttribute === 'SFS') {
      if (sfsTruthyValues.has(entry.CourseAttributeValue)) {
        nusAttributes[attributeMap[entry.CourseAttribute]] = true;
      } else if (!falsyValues.has(entry.CourseAttributeValue)) {
        logger.warn(
          { key: entry.CourseAttribute, value: entry.CourseAttributeValue },
          'Non-standard course attribute value',
        );
      }
      continue;
    }

    if (truthyValues.has(entry.CourseAttributeValue)) {
      nusAttributes[attributeMap[entry.CourseAttribute]] = true;
    } else if (!falsyValues.has(entry.CourseAttributeValue)) {
      logger.warn(
        { key: entry.CourseAttribute, value: entry.CourseAttributeValue },
        'Non-standard course attribute value',
      );
    }
  }

  if (isEmpty(nusAttributes)) {
    return undefined;
  }
  return nusAttributes;
}

/**
 * Clean module info
 * - Remove empty fields and fields with text like 'nil'
 * - Trim whitespace from module title, description and other text fields
 * - Properly capitalize ALL CAPS title
 */
export function cleanModuleInfo(module: SemesterModule) {
  let cleanedModule = { ...module };

  // Title case module title if it is all uppercase
  if (cleanedModule.title === cleanedModule.title.toUpperCase()) {
    cleanedModule.title = titleize(cleanedModule.title);
  }

  // Remove empty values like 'nil' and empty strings for keys that allow them
  // to be nullable
  cleanedModule = removeEmptyValues(cleanedModule, [
    'workload',
    'gradingBasisDescription',
    'prerequisite',
    'prerequisiteRule',
    'prerequisiteAdvisory',
    'corequisite',
    'corequisiteRule',
    'preclusion',
    'preclusionRule',
  ]);

  // Remove whitespace from some string values
  trimValues(cleanedModule, ['title', 'description', 'prerequisite', 'corequisite', 'preclusion']);

  return cleanedModule;
}

/**
 * Parse the workload string into a mapping of individual components to their hours.
 * If the string is unparsable, it is returned without any modification.
 */
export function parseWorkload(workloadString: string | null | undefined): Workload | undefined {
  if (!workloadString) {
    return undefined;
  }

  const cleanedWorkloadString = workloadString
    .replaceAll(/\(.*?\)/g, '') // Remove stuff in parenthesis
    .replaceAll('NA', '0') // Replace 'NA' with 0
    .replaceAll(/\s+/g, ''); // Remove whitespace

  if (!/^((^|-|‐)([\d.]+)){5}$/.test(cleanedWorkloadString)) {
    return workloadString;
  }
  // Workload string is formatted as A-B-C-D-E where
  // A: no. of lecture hours per week
  // B: no. of tutorial hours per week
  // C: no. of laboratory hours per week
  // D: no. of hours for projects, assignments, fieldwork etc per week
  // E: no. of hours for preparatory work by a student per week
  // Taken from CORS:
  // https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?acad_y=2017/2018&sem_c=1&mod_c=CS2105
  return cleanedWorkloadString.split(/[-‐]/).map((text: string) => Number.parseFloat(text));
}

export function getLessonCovidZones(lessons: Array<RawLesson>): Array<CovidZoneId> {
  const zones = new Set<CovidZoneId>();
  for (const { covidZone } of lessons) {
    zones.add(covidZone);
  }
  return Array.from(zones);
}

/**
 * Map ModuleInfo from the API into something closer to our own representation
 */
const mapModuleInfo = (
  moduleInfo: ModuleInfo,
  departmentMap: DepartmentCodeMap,
  facultyMap: FacultyCodeMap,
  logger: Logger,
  acadYear: string,
): SemesterModule => {
  const {
    AcademicGroup,
    AdditionalInformation,
    CatalogNumber,
    CorequisiteRule,
    CorequisiteSummary,
    CourseAttributes = [],
    CourseDesc,
    GradingBasisDesc,
    OrganisationCode,
    PreclusionRule,
    PreclusionSummary,
    PreRequisiteAdvisory,
    PrerequisiteRule,
    PrerequisiteSummary,
    SubjectArea,
    Title,
    UnitsMin,
    WorkloadHoursNUSMods,
  } = moduleInfo;

  // We map department from our department list because
  // AcademicOrganisation.Description is empty for some reason
  return {
    acadYear,
    additionalInformation: AdditionalInformation ?? undefined,
    attributes: mapAttributes(
      CourseAttributes.map((attr) => ({
        CourseAttribute: attr.Code.trim(),
        CourseAttributeValue: attr.Value.trim(),
      })),
      logger,
    ),
    corequisite: CorequisiteSummary ?? undefined,
    corequisiteRule: CorequisiteRule ?? undefined,
    department: departmentMap[OrganisationCode],
    description: CourseDesc ?? undefined,
    faculty: facultyMap[AcademicGroup],
    gradingBasisDescription: GradingBasisDesc || '',
    moduleCode: SubjectArea + CatalogNumber,
    moduleCredit: UnitsMin === null ? '0' : String(UnitsMin),
    preclusion: PreclusionSummary ?? undefined,
    preclusionRule: PreclusionRule ?? undefined,
    prerequisite: PrerequisiteSummary ?? undefined,
    prerequisiteAdvisory: PreRequisiteAdvisory ?? undefined,
    prerequisiteRule: PrerequisiteRule ?? undefined,
    title: Title,
    workload: parseWorkload(WorkloadHoursNUSMods),
  };
};

/**
 * Clean, combine and save module info, timetable, and exam info for a single
 * semester. Module info is provided as input (fetched once externally by
 * GetAllModules). Timetable and exam data are fetched per-semester.
 *
 * Output:
 * - <semester>/<module code>/semesterData.json
 */
export default class GetSemesterData extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  outputCache: Cache<Output>;

  get name() {
    return `Get data for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    assert(validateSemester(semester), `${semester} is not a valid semester`);

    super(academicYear);

    this.semester = semester;
    this.academicYear = academicYear;
    this.outputCache = this.getCache<Output>(`semester-${semester}-module-data`);
    this.logger = this.rootLogger.child({
      semester,
      task: GetSemesterData.name,
      year: academicYear,
    });
  }

  async run(input: Input) {
    const { academicYear, semester } = this;

    this.logger.info(`Getting semester data for ${academicYear} semester ${semester}`);

    // Fetch timetable (if not pre-fetched) and exams in parallel
    const [timetables, exams] = await Promise.all([
      input.timetables ?? new GetSemesterTimetable(semester, academicYear).run(),
      new GetSemesterExams(semester, academicYear).run(),
    ]);

    const { modules } = input;

    // Map department and faculty codes to their names for use during module
    // data sanitization
    const departmentMap = getDepartmentCodeMap(input.departments);
    const facultyMap = getFacultyCodeMap(input.faculties);

    // Key modules by their module code for easier mapping
    const modulesMap = keyBy(
      modules,
      (moduleInfo) => moduleInfo.SubjectArea + moduleInfo.CatalogNumber,
    );

    // Combine all three source of data into one set of semester module info.
    //
    // The data source is less consistent than we'd like, because there are
    // modules with timetable but no module info, and modules with exam info
    // but no timetable/module info.
    const semesterModuleData: Array<SemesterModuleData> = [];
    each(modulesMap, (moduleInfo, moduleCode) => {
      const logger = this.logger.child({ moduleCode });

      // Map module info to the shape expected by our frontend and clean up
      // the data by removing nil fields and fixing data issues
      const rawModule = mapModuleInfo(moduleInfo, departmentMap, facultyMap, logger, academicYear);
      const module = cleanModuleInfo(rawModule);

      const timetable = timetables[moduleCode];
      const semesterModuleDatum: WritableSemesterModuleData = {
        module,
        moduleCode,
      };

      // Modules without timetable lessons are not offered this semester.
      // Store the module anyway so that we know it exists, but don't set
      // semesterData.
      if (timetable) {
        const examInfo = exams[moduleCode] || {};
        semesterModuleDatum.semesterData = {
          covidZones: getLessonCovidZones(timetable),
          semester,
          timetable,
          ...examInfo,
        };
      }

      semesterModuleData.push(semesterModuleDatum);
    });

    // Post-processing: Propagate timetable data to dual-coded modules
    // The new NUS API only returns timetable data for one code of dual-coded modules.
    // This step matches modules without timetable to those with timetable based on
    // title, credits, and description, then copies the timetable data.
    //
    // Only consider modules that have no timetable in ANY semester as propagation
    // targets. Modules with timetable data in other semesters are genuinely offered
    // there and should not receive propagated data here (e.g. GESS1000T is offered
    // in ST1 and should not get Sem 2 timetable from GES1002).
    const modulesWithTimetable = semesterModuleData
      .filter((m) => m.semesterData !== undefined)
      .map((m) => modulesMap[m.moduleCode]);
    const modulesWithoutTimetable = semesterModuleData
      .filter(
        (m) => m.semesterData === undefined && !input.modulesWithAnyTimetable?.has(m.moduleCode),
      )
      .map((m) => modulesMap[m.moduleCode]);

    const equivalentModules = findEquivalentModules(modulesWithoutTimetable, modulesWithTimetable);

    if (equivalentModules.size > 0) {
      this.logger.info(
        {
          equivalents: Array.from(equivalentModules.entries()).map(([target, source]) => ({
            source,
            target,
          })),
        },
        `Found ${equivalentModules.size} equivalent module(s) - propagating timetable data`,
      );

      // Copy timetable data from source modules to target modules
      for (const [targetCode, sourceCode] of equivalentModules.entries()) {
        const targetDatum = semesterModuleData.find((m) => m.moduleCode === targetCode) as
          | WritableSemesterModuleData
          | undefined;
        const sourceDatum = semesterModuleData.find((m) => m.moduleCode === sourceCode);

        if (targetDatum && sourceDatum?.semesterData) {
          // Get exam info for the target module (if any)
          const targetExamInfo = exams[targetCode] || {};

          // Copy timetable and covidZones from source, but use target's own exam info
          targetDatum.semesterData = {
            covidZones: sourceDatum.semesterData.covidZones,
            semester,
            timetable: sourceDatum.semesterData.timetable,
            ...targetExamInfo,
          };
          targetDatum.timetablePropagated = true;
        }
      }
    }

    // Log modules that have timetables but no module info
    const noInfoModulesWithTimetables = Array.from(
      difference(new Set(Object.keys(timetables)), new Set(Object.keys(modulesMap))),
    );
    if (noInfoModulesWithTimetables.length > 0) {
      this.logger.debug(
        { moduleCodes: noInfoModulesWithTimetables.sort() },
        'Found modules with timetable but no info',
      );
    }

    // Log modules that have exams but no timetables
    const noInfoModulesWithExams = Array.from(
      difference(new Set(Object.keys(exams)), new Set(Object.keys(modulesMap))),
    );
    if (noInfoModulesWithExams.length > 0) {
      this.logger.debug(
        { moduleCodes: noInfoModulesWithExams.sort() },
        'Found modules with exam but no info',
      );
    }

    // Save the merged semester data to disk
    await Promise.all(
      semesterModuleData.map(
        ({ moduleCode, semesterData }) =>
          semesterData && this.io.semesterData(this.semester, moduleCode, semesterData),
      ),
    );

    // Cache semester data to disk
    await this.outputCache.write(semesterModuleData);

    return semesterModuleData;
  }
}
