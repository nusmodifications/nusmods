import { escapeRegExp, map } from 'lodash';

import { AcademicGrp, AcademicOrg } from '../types/api';
import { Task } from '../types/tasks';
import { Cache } from '../types/persist';

import BaseTask from './BaseTask';
import { cacheDownload } from '../utils/api';

const abbreviationMap = {
  Mgmt: 'Management',
  Eng: 'Engineering',
  Conserv: 'Conservatory',
  Edun: 'Education',
  Ctr: 'Center',
  Appl: 'Applied',
  "Computat'l": 'Computational',
  Instits: 'Institutes',
  Div: 'Division',
  Info: 'Information',
  Sci: 'Science',
  Grad: 'Graduate',
  DO: "Dean's Office",
  Stud: 'Studies',
  'Coll.': 'College',
};

const abbreviationRegex = map(abbreviationMap, (expanded, abbr): [RegExp, string] => [
  // (?!\S) instead of \b because \b (word boundary) doesn't account for the . in "Coll."
  new RegExp(`\\b${escapeRegExp(abbr)}(?!\\S)`, 'gi'),
  expanded,
]);

export function cleanNames(name: string): string {
  // 1. Expand all abbreviations. '&' has to be defined separately because it
  //    cannot be combined with word boundaries (\b) anchors
  let expandedName = name.replace(/&/g, 'and');
  abbreviationRegex.forEach(([regex, expanded]) => {
    expandedName = expandedName.replace(regex, expanded);
  });

  // 2. Remove redundant parts
  return expandedName
    .replace(/^(School|Faculty) of/i, '')
    .replace(/^The/, '')
    .trim();
}

export const cleanFacultyDepartment = <T extends AcademicGrp | AcademicOrg>(
  organization: T,
): T => ({
  ...organization,
  Description: cleanNames(organization.Description),
});

/**
 * Map department to their faculties. This is useful for the frontend
 */
export function mapFacultyDepartments(
  faculties: AcademicGrp[],
  departments: AcademicOrg[],
): { [key: string]: string[] } {
  // Get a mapping of faculty code -> name
  const facultyCodes: { [faculty: string]: string } = {};
  const mappings: { [faculty: string]: string[] } = {};

  faculties.forEach((faculty) => {
    facultyCodes[faculty.AcademicGroup] = faculty.Description;
    mappings[faculty.Description] = [];
  });

  // Then add each department to their faculty
  departments.forEach((department) => {
    // The department code's first three characters is its faculty code
    const faculty = facultyCodes[department.AcademicOrganisation.slice(0, 3)];

    if (mappings[faculty] && !mappings[faculty].includes(department.Description)) {
      mappings[faculty].push(department.Description);
    }
  });

  return mappings;
}

interface Output {
  departments: AcademicOrg[];
  faculties: AcademicGrp[];
}

// Cache these for 7 days since they change rarely
const cacheExpiry = 7 * 24 * 60;

/**
 * Downloads faculty and department codes. This is used to map to the codes that appear in
 * module information.
 *
 * Output:
 *  - facultyDepartments.json
 */
export default class GetFacultyDepartment extends BaseTask implements Task<void, Output> {
  name = 'Get faculties and departments';

  logger = this.rootLogger.child({
    task: GetFacultyDepartment.name,
  });

  departmentCache: Cache<AcademicOrg[]>;
  facultyCache: Cache<AcademicGrp[]>;

  constructor(academicYear: string) {
    super(academicYear);

    this.departmentCache = this.getCache('departments', cacheExpiry);
    this.facultyCache = this.getCache('faculty', cacheExpiry);
  }

  async getDepartments() {
    return cacheDownload(
      'department codes',
      this.api.getDepartment,
      this.departmentCache,
      this.logger,
    );
  }

  async getFaculties() {
    return cacheDownload('faculty codes', this.api.getFaculty, this.facultyCache, this.logger);
  }

  async run() {
    this.logger.info('Downloading faculty and department codes');

    // Download department and faculties in parallel
    let [departments, faculties] = await Promise.all([this.getDepartments(), this.getFaculties()]);

    departments = departments.map(cleanFacultyDepartment);
    faculties = faculties.map(cleanFacultyDepartment);

    // Save the mapping of departments to faculties
    const mappings = mapFacultyDepartments(faculties, departments);
    await this.io.facultyDepartments(mappings);

    // Return data for next task in pipeline
    return {
      departments,
      faculties,
    };
  }
}
