import { sum } from 'lodash-es';
import {
  CohortCondition,
  ModuleCode,
  PrereqTree,
  ProgramTypeCondition,
  Semester,
} from 'types/modules';
import { PlannerModuleInfo, Conflict } from 'types/planner';
import config from 'config';
import { assertNever } from 'types/utils';
import { count, isEmpty } from './array';

// "Exemption" and "plan to take" modules are special columns used to hold modules
// outside the normal planner. "Exemption" modules are coded as -1 year so
// they can always be used to fulfill prereqs, while "plan to take" modules use
// 3000 so they can never fulfill prereqs
export const EXEMPTION_YEAR = '-1';
export const EXEMPTION_SEMESTER: Semester = -1;

export const PLAN_TO_TAKE_YEAR = '3000';
export const PLAN_TO_TAKE_SEMESTER = -2;

const GRADE_REQUIREMENT_SEPARATOR = ':';
const MODULE_WILD_CARD = '%';

// We assume iBLOCs takes place in special term 1
export const IBLOCS_SEMESTER = 3;

export function getSemesterName(semester: Semester) {
  if (semester === EXEMPTION_SEMESTER) {
    return 'Exemptions';
  }
  if (semester === PLAN_TO_TAKE_SEMESTER) {
    return 'Plan to Take';
  }

  return config.semesterNames[semester];
}

/**
 * A cohort year token looks like "S:2022" (start/from, inclusive) or
 * "E:2019/20" (end/until, inclusive). The year part may be a calendar year or
 * an academic-year string, so we parse the leading year from it.
 */
function cohortTokenYear(token: string): number {
  return parseInt(token.slice(2), 10);
}

/**
 * Determine whether a cohort-gated requirement applies to a student who
 * matriculated in the given year. When the matriculation year is unknown we
 * conservatively assume it applies, matching the previous behaviour where the
 * gate was ignored and the inner requirement always enforced.
 */
export function cohortConditionApplies(
  { rule, years }: CohortCondition,
  cohortYear?: number,
): boolean {
  if (cohortYear === undefined || Number.isNaN(cohortYear)) return true;

  const inRange = years.every((token) => {
    const year = cohortTokenYear(token);
    if (Number.isNaN(year)) return true;
    // "E:" is an upper bound (cohorts up to and including the year); any other
    // bound ("S:") is a lower bound (cohorts from the year onwards).
    return token.startsWith('E') ? cohortYear <= year : cohortYear >= year;
  });

  return rule === 'IF_NOT_IN' || rule === 'MUST_NOT_BE_IN' ? !inRange : inRange;
}

/**
 * Human-readable description of a cohort condition, e.g. "cohort 2022 onwards".
 */
export function formatCohortCondition({ rule, years }: CohortCondition): string {
  const tokenYear = (token?: string) => {
    if (token === undefined) return undefined;
    const year = cohortTokenYear(token);
    return Number.isNaN(year) ? undefined : year;
  };
  const start = tokenYear(years.find((y) => !y.startsWith('E')));
  const end = tokenYear(years.find((y) => y.startsWith('E')));

  let range: string;
  if (start !== undefined && end !== undefined) {
    range = start === end ? `cohort ${start}` : `cohorts ${start}–${end}`;
  } else if (start !== undefined) {
    range = `cohort ${start} onwards`;
  } else if (end !== undefined) {
    range = `cohorts up to ${end}`;
  } else {
    range = 'select cohorts';
  }

  const exclude = rule === 'IF_NOT_IN' || rule === 'MUST_NOT_BE_IN';
  return exclude ? `cohorts excluding ${range}` : range;
}

/**
 * Human-readable description of a program-type condition, e.g.
 * "Undergraduate Degree" or "Graduate Degree Coursework or Graduate Degree
 * Research".
 */
export function formatProgramTypeCondition({ types }: ProgramTypeCondition): string {
  return types.join(' or ');
}

/**
 * Check if a prereq tree is fulfilled given a set of modules that have already
 * been taken. An array of unfulfilled requirements is returned. An empty array
 * means that the prereq tree is fulfilled. `cohortYear` is the student's
 * matriculation year, used to evaluate cohort-gated requirements.
 */
export function checkPrerequisite(
  moduleSet: Set<ModuleCode>,
  tree: PrereqTree,
  cohortYear?: number,
): PrereqTree[] {
  const moduleArray = Array.from(moduleSet);

  function walkTree(fragment: PrereqTree): PrereqTree[] {
    if (typeof fragment === 'string') {
      // Parse a module code requirement as an nOf fragment.
      return walkTree({ nOf: [1, [fragment]] });
    }

    if ('or' in fragment) {
      // All return non-null = all unfulfilled
      return fragment.or.some((child) => isEmpty(walkTree(child))) ? [] : [fragment];
    }

    if ('and' in fragment) {
      return fragment.and.map(walkTree).flat();
    }

    if ('cohort' in fragment) {
      const applies = cohortConditionApplies(fragment.cohort, cohortYear);
      if (fragment.then === undefined) {
        // A bare cohort constraint is an eligibility requirement: unfulfilled
        // when the student's matriculation year doesn't match.
        return applies ? [] : [fragment];
      }
      // The gated requirement only applies to matching cohorts. If it doesn't
      // apply to this student, there is nothing left to fulfil.
      return applies ? walkTree(fragment.then) : [];
    }

    if ('programType' in fragment) {
      // Display only: the planner has no program-type input, so a
      // program-type-gated requirement is never treated as unmet.
      return [];
    }

    if ('nOf' in fragment) {
      const [requiredCount, options] = fragment.nOf;
      let fulfilledCount = 0;
      options.forEach((opt) => {
        if (typeof opt === 'string') {
          const module = opt.split(GRADE_REQUIREMENT_SEPARATOR)[0];
          if (module.includes(MODULE_WILD_CARD)) {
            const [prefix] = module.split(MODULE_WILD_CARD);
            // Assumption: prefixes do not overlap.
            fulfilledCount += count(moduleArray, (moduleCode) => moduleCode.startsWith(prefix));
          } else {
            fulfilledCount += +moduleSet.has(module);
          }
          return;
        }
        fulfilledCount += +!isEmpty(walkTree(opt));
      });
      if (fulfilledCount >= requiredCount) return [];
      if (requiredCount === 1 && options.length === 1) return [options[0]];
      return [fragment];
    }

    return assertNever(fragment);
  }

  return walkTree(tree);
}

/**
 * Converts conflicts into human readable text form
 */
export function conflictToText(rootConflict: PrereqTree): string {
  function walkSubtree(conflict: PrereqTree): string {
    const text = walkTree(conflict);
    if (typeof conflict === 'string') return text;
    return `(${text})`;
  }
  function walkTree(conflict: PrereqTree): string {
    if (typeof conflict === 'string') return conflict.split(GRADE_REQUIREMENT_SEPARATOR)[0];

    if ('or' in conflict) {
      return `${conflict.or.map(walkSubtree).join(' or ')}`;
    }

    if ('and' in conflict) {
      return `${conflict.and.map((opt) => `${walkSubtree(opt)}`).join(' and ')}`;
    }

    if ('cohort' in conflict) {
      // A bare cohort constraint surfaces as the conflict itself, so describe
      // the cohort. For a gated requirement the gate has already been
      // evaluated, so render the requirement.
      return conflict.then === undefined
        ? formatCohortCondition(conflict.cohort)
        : walkTree(conflict.then);
    }

    if ('programType' in conflict) {
      // Program-type gates are not evaluated, so they should not surface as a
      // conflict on their own; describe the gated requirement defensively.
      return walkTree(conflict.then);
    }

    if ('nOf' in conflict) {
      const [n, conflicts] = conflict.nOf;
      return `at least ${n} of ${conflicts.map(walkSubtree).join(', ')}`;
    }

    return assertNever(conflict);
  }
  return walkTree(rootConflict);
}

/**
 * Create an unique Droppable ID for each semester of each year
 */
export function getDroppableId(year: string, semester: Semester): string {
  return `${year}|${semester}`;
}

/**
 * Extract the acad year and semester from the Droppable ID. The reverse of
 * getDroppableId.
 */
export function fromDroppableId(id: string): [string, Semester] {
  const [acadYear, semesterString] = id.split('|');
  return [acadYear, +semesterString];
}

// Create shortened AY labels - eg. 2019/2020 -> 19/20
export function acadYearLabel(year: string) {
  // Remove the 20 prefix from AY
  return year.replace(/\d{4}/g, (match) => match.slice(2));
}

/**
 * Get a planner module's title, preferring customInfo over moduleInfo.
 * This allows the user to override our data in case there are mistakes.
 */
export function getModuleTitle(
  module: Pick<PlannerModuleInfo, 'moduleInfo' | 'customInfo'>,
): string | null {
  const { moduleInfo, customInfo } = module;
  // customInfo.title is nullable, and there's no point in displaying an
  // empty string, so we can use || here
  return (customInfo && customInfo.title) || (moduleInfo && moduleInfo.title) || null;
}

/**
 * Get a planner module's credits, preferring customInfo over moduleInfo.
 * This allows the user to override our data in case there are mistakes.
 */
export function getModuleCredit(
  module: Pick<PlannerModuleInfo, 'moduleInfo' | 'customInfo'>,
): number | null {
  const { moduleInfo, customInfo } = module;

  // Or operator (||) is not used because moduleCredit can be 0, which is
  // a falsey value
  if (customInfo) return customInfo.moduleCredit;
  if (moduleInfo) return +moduleInfo.moduleCredit;
  return null;
}

/**
 * Get total module credits for the given array of planner modules
 */
export function getTotalMC(
  modules: Pick<PlannerModuleInfo, 'moduleInfo' | 'customInfo'>[],
): number {
  // Remove nulls using .filter(Boolean)
  return sum(modules.map(getModuleCredit).filter(Boolean));
}

/**
 * Get a conflict to display among an array of possible conflicts
 */
export function getConflictToDisplay(
  conflicts: Conflict[],
  isCurrentYear: boolean,
): Conflict | null {
  if (isEmpty(conflicts)) {
    return null;
  }

  if (isCurrentYear) {
    return conflicts[0];
  }

  // either prereq or duplicate or none if not same year
  return (
    conflicts.find((c) => c.type === 'prereq') ||
    conflicts.find((c) => c.type === 'duplicate') ||
    null
  );
}
