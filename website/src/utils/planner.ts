import { sum } from 'lodash';
import { ModuleCode, PrereqTree, Semester } from 'types/modules';
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
 * Check if a prereq tree is fulfilled given a set of modules that have already
 * been taken. An array of unfulfilled requirements is returned. An empty array
 * means that the prereq tree is fulfilled.
 */
export function checkPrerequisite(moduleSet: Set<ModuleCode>, tree: PrereqTree): PrereqTree[] {
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
