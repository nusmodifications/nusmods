import { each, fromPairs, keyBy, isEmpty } from 'lodash';
import { strict as assert } from 'assert';

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
import GetSemesterModules from './GetSemesterModules';
import { fromTermCode } from '../utils/api';
import { validateSemester } from '../services/validation';
import { removeEmptyValues, titleize, trimValues, decodeHTMLEntities } from '../utils/data';
import { difference } from '../utils/set';
import { Logger } from '../services/logger';

interface Input {
  departments: AcademicOrg[];
  faculties: AcademicGrp[];
}

type Output = SemesterModuleData[];

/**
 * Create a mapping of department code to department name from a list of faculties
 */
export const getDepartmentCodeMap = (departments: AcademicOrg[]): DepartmentCodeMap =>
  fromPairs(
    departments.map((department) => [department.AcademicOrganisation, department.Description]),
  );

export const getFacultyCodeMap = (departments: AcademicGrp[]): FacultyCodeMap =>
  fromPairs(departments.map((faculty) => [faculty.AcademicGroup, faculty.Description]));

const attributeMap: { [attribute: string]: keyof NUSModuleAttributes } = {
  YEAR: 'year',
  UROP: 'urop',
  SSGF: 'ssgf',
  SFS: 'sfs',
  PRQY: 'su',
  NPRY: 'su',
  GRDY: 'grsu',
  LABB: 'lab',
  ISM: 'ism',
  HFYP: 'fyp',
  // MPE handled separately as it maps to multiple attributes
};

const mpeValueMap: { [attribute: string]: (keyof NUSModuleAttributes)[] } = {
  S1: ['mpes1'],
  S2: ['mpes2'],
  'S1&S2': ['mpes1', 'mpes2'],
};

export function mapAttributes(
  attributes: ModuleAttributeEntry[],
  logger: Logger,
): NUSModuleAttributes | undefined {
  const nusAttributes: NUSModuleAttributes = {};

  for (const entry of attributes) {
    if (entry.CourseAttribute === 'MPE') {
      const mappedAttributes = mpeValueMap[entry.CourseAttributeValue];
      if (!mappedAttributes) {
        logger.warn(
          { value: entry.CourseAttributeValue, key: entry.CourseAttribute },
          'Non-standard course attribute value',
        );
      } else {
        for (const attr of mappedAttributes) {
          nusAttributes[attr] = true;
        }
      }
      continue;
    }

    if (!attributeMap[entry.CourseAttribute]) continue;

    if (entry.CourseAttributeValue === 'YES' || entry.CourseAttributeValue === 'HT') {
      nusAttributes[attributeMap[entry.CourseAttribute]] = true;
    } else if (entry.CourseAttributeValue !== 'NO') {
      logger.warn(
        { value: entry.CourseAttributeValue, key: entry.CourseAttribute },
        'Non-standard course attribute value',
      );
    }
  }

  if (isEmpty(nusAttributes)) return undefined;
  return nusAttributes;
}

/**
 * Clean module info
 * - Remove empty fields and fields with text like 'nil'
 * - Trim whitespace from module title, description and other text fields
 * - Properly capitalize ALL CAPS title
 * - Decode HTML entities in description such as '&224;' to 'à'
 */
export function cleanModuleInfo(module: SemesterModule) {
  let cleanedModule = module;

  // Title case module title if it is all uppercase
  if (cleanedModule.title === cleanedModule.title.toUpperCase()) {
    cleanedModule.title = titleize(cleanedModule.title);
  }

  if (cleanedModule.description != null) {
    cleanedModule.description = decodeHTMLEntities(cleanedModule.description);
  }

  // Remove empty values like 'nil' and empty strings for keys that allow them
  // to be nullable
  cleanedModule = removeEmptyValues(cleanedModule, [
    'workload',
    'prerequisite',
    'corequisite',
    'preclusion',
  ]);

  // Remove whitespace from some string values
  trimValues(cleanedModule, ['title', 'description', 'prerequisite', 'corequisite', 'preclusion']);

  return cleanedModule;
}

/**
 * Parse the workload string into a mapping of individual components to their hours.
 * If the string is unparsable, it is returned without any modification.
 */
export function parseWorkload(workloadString: string): Workload {
  const cleanedWorkloadString = workloadString
    .replace(/\(.*?\)/g, '') // Remove stuff in parenthesis
    .replace(/NA/gi, '0') // Replace 'NA' with 0
    .replace(/\s+/g, ''); // Remove whitespace

  if (!/^((^|-|‐)([\d.]+)){5}$/.test(cleanedWorkloadString)) return workloadString;
  // Workload string is formatted as A-B-C-D-E where
  // A: no. of lecture hours per week
  // B: no. of tutorial hours per week
  // C: no. of laboratory hours per week
  // D: no. of hours for projects, assignments, fieldwork etc per week
  // E: no. of hours for preparatory work by a student per week
  // Taken from CORS:
  // https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?acad_y=2017/2018&sem_c=1&mod_c=CS2105
  return cleanedWorkloadString.split(/[-‐]/).map((text) => parseFloat(text));
}

export function getLessonCovidZones(lessons: RawLesson[]): CovidZoneId[] {
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
): SemesterModule => {
  const {
    Term,
    AcademicOrganisation,
    AcademicGroup,
    CourseTitle,
    WorkLoadHours,
    Preclusion,
    PreRequisite,
    CoRequisite,
    ModularCredit,
    Description,
    Subject,
    CatalogNumber,
    ModuleAttributes = [],
  } = moduleInfo;

  const [AcadYear] = fromTermCode(Term);

  // We map department from our department list because
  // AcademicOrganisation.Description is empty for some reason
  return {
    acadYear: AcadYear,
    preclusion: Preclusion,
    description: Description,
    title: CourseTitle,
    department: departmentMap[AcademicOrganisation.Code],
    faculty: facultyMap[AcademicGroup.Code],
    workload: parseWorkload(WorkLoadHours),
    prerequisite: PreRequisite,
    corequisite: CoRequisite,
    moduleCredit: ModularCredit,
    moduleCode: Subject + CatalogNumber,
    attributes: mapAttributes(ModuleAttributes, logger),
  };
};

/**
 * Download, clean and combine module info, timetable, and exam info. This task
 * uses the subtasks
 * - GetSemesterExams
 * - GetSemesterModules
 * - GetSemesterTimetable
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
      year: academicYear,
      task: GetSemesterData.name,
    });
  }

  async run(input: Input) {
    const { semester, academicYear } = this;

    this.logger.info(`Getting semester data for ${academicYear} semester ${semester}`);

    // Do this before the other tasks so that it won't timeout because the API
    // server can't handle the load created by trying to fetch all modules in
    // parallel
    const timetables = await new GetSemesterTimetable(semester, academicYear).run();

    // Get exams and module info in parallel
    const [exams, modules] = await Promise.all([
      new GetSemesterExams(semester, academicYear).run(),
      new GetSemesterModules(semester, academicYear).run(input),
    ]);

    // Map department and faculty codes to their names for use during module
    // data sanitization
    const departmentMap = getDepartmentCodeMap(input.departments);
    const facultyMap = getFacultyCodeMap(input.faculties);

    // Key modules by their module code for easier mapping
    const modulesMap = keyBy(
      modules,
      (moduleInfo) => moduleInfo.Subject + moduleInfo.CatalogNumber,
    );

    // Combine all three source of data into one set of semester module info.
    //
    // The data source is less consistent than we'd like, because there are
    // modules with timetable but no module info, and modules with exam info
    // but no timetable/module info.
    const semesterModuleData: SemesterModuleData[] = [];
    each(modulesMap, (moduleInfo, moduleCode) => {
      const logger = this.logger.child({ moduleCode });

      // Map module info to the shape expected by our frontend and clean up
      // the data by removing nil fields and fixing data issues
      const rawModule = mapModuleInfo(moduleInfo, departmentMap, facultyMap, logger);
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
          semester,
          timetable,
          covidZones: getLessonCovidZones(timetable),
          ...examInfo,
        };
      }

      semesterModuleData.push(semesterModuleDatum);
    });

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
