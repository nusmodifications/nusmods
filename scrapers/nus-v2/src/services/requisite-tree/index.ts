import { entries, uniq } from 'lodash';

import { Module, ModuleCode, PrereqTree } from '../../types/modules';
import { ModuleWithoutTree } from '../../types/mapper';
import rootLogger, { Logger } from '../logger';

import { MODULE_REGEX, OPERATORS_REGEX } from './constants';
import parseString from './parseString';
import normalizeString from './normalizeString';
import { flattenTree } from './tree';

/**
 * Generate the following fields for modules:
 *
 * FulfillRequirements: modules that cannot be taken until this module is fulfilled
 * PrereqTree: different format of ParsedPrerequisite
 */

export type PrereqTreeMap = {
  [moduleCode: string]: PrereqTree;
};

const logger = rootLogger.child({
  service: 'requisite-tree',
});

// Add any key-words and reasons for which NO parsing should be done and
// the entire pre-req string should be shown instead
const RESTRICTED_KEYWORDS = [
  // Requirement to be USP students cannot be represented
  'USP',
  // Yearly based modules cannot be represented
  'Cohort',
  'cohort',
  'AY20',
  // no QET module
  'Qualifying English Test',
  // requirement by grade cannot be represented
  'grade',
  'Grade',
  'At least a B-',
  'Honours eligibility requirements',
  // requirement by mc cannot be represented
  'MC',
  // 4 out of 5 requirement cannot be represented
  '4 out of the 5',
  '4 of the 5',
  // Negative prereqs (eg. any English module except ES1000) cannot be represented
  'not',
  'NOT',
  'Not',
];

function parse(data: ModuleWithoutTree[], subLogger: Logger): PrereqTreeMap {
  const results: PrereqTreeMap = {};

  for (const module of data) {
    const { moduleCode, prerequisite: value } = module;

    if (
      // Filter out empty values
      value &&
      // Filter out values which don't contain any module codes
      MODULE_REGEX.exec(value) &&
      // Filter out values with restricted keywords which indicate the value
      // has some requirements that cannot be parsed as a tree
      !RESTRICTED_KEYWORDS.some((keyword) => value.includes(keyword))
    ) {
      // Sanitize, then parse the value
      const normalizedValue = normalizeString(value, moduleCode);
      const moduleLog = subLogger.child({ moduleCode });

      const parsedValue = parseString(normalizedValue, moduleLog);

      if (parsedValue) {
        results[module.moduleCode] = parsedValue;
      }
    }
  }

  return results;
}

/**
 * Insert the PrereqTree and FulfillRequirements properties to Module objects
 */
export function insertRequisiteTree(modules: Module[], prerequisites: PrereqTreeMap): Module[] {
  // Find modules which this module fulfill the requirements for
  const fulfillModulesMap: { [moduleCode: string]: Set<ModuleCode> } = {};
  for (const module of modules) {
    fulfillModulesMap[module.moduleCode] = new Set();
  }

  for (const [moduleCode, prereqs] of entries(prerequisites)) {
    for (const fulfillsModule of flattenTree(prereqs)) {
      if (fulfillModulesMap[fulfillsModule]) {
        // Since module requires fulfillsModule, that means fulfillsModule
        // fulfills the requirements for module
        fulfillModulesMap[fulfillsModule].add(moduleCode);
      }
    }
  }

  for (const module of modules) {
    const { moduleCode } = module;

    if (prerequisites[moduleCode]) {
      module.prereqTree = prerequisites[moduleCode];
    }

    if (fulfillModulesMap[moduleCode].size > 0) {
      module.fulfillRequirements = Array.from(fulfillModulesMap[moduleCode]);
    }
  }

  return modules;
}

export default async function generatePrereqTree(
  allModules: ModuleWithoutTree[],
): Promise<Module[]> {
  // check that all modules match regex and no modules contain operators
  const moduleCodes: string[] = uniq(allModules.map((module) => module.moduleCode));

  for (const moduleCode of moduleCodes) {
    const isModule = MODULE_REGEX.test(moduleCode);

    if (!isModule) {
      throw new Error(`Module ${moduleCode}'s module code does not match regex.`);
    }

    if (OPERATORS_REGEX.test(moduleCode)) {
      throw new Error(`Module ${moduleCode}'s module code contains operators.`);
    }
  }

  const prerequisites = parse(allModules, logger);
  const modules = insertRequisiteTree(allModules, prerequisites);

  return modules;
}
