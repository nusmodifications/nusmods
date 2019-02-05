// @flow

import { entries, uniq } from 'lodash';

import type { Module, ModuleCode, PrereqTree } from '../../types/modules';
import type { ModuleWithoutTree } from '../../types/mapper';
import rootLogger, { Logger } from '../logger';

import { MODULE_REGEX, OPERATORS_REGEX } from './constants';
import parseString from './parseString';
import normalizeString from './normalizeString';
import { flattenTree } from './tree';

/**
 * Generate the following fields for modules:
 *
 * FulfillRequirements: modules that cannot be taken until this module is fulfilled
 * ModmavenTree: different format of ParsedPrerequisite
 */

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
  // no A-level modules
  'A-level',
  'H1 ',
  'H2 ',
  // requirement by mc cannot be represented
  'MC',
  // 4 out of 5 requirement cannot be represented
  '4 out of the 5',
  '4 of the 5',
];

function parse(data: ModuleWithoutTree[], subLogger: Logger): { [ModuleCode]: PrereqTree } {
  const results = {};

  for (const module of data) {
    const moduleCode = module.ModuleCode;
    const value = module.Prerequisite;

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
        results[module.ModuleCode] = parsedValue;
      }
    }
  }

  return results;
}

function generateRequirements(allModules, prerequisites): Module[] {
  // Find modules which this module fulfill the requirements for
  const fulfillModules = {};
  allModules.forEach((module) => {
    fulfillModules[module.ModuleCode] = new Set();
  });

  for (const [moduleCode, prereqs] of entries(prerequisites)) {
    for (const fulfillsModule of flattenTree(prereqs)) {
      if (fulfillModules[fulfillsModule]) {
        // Since module requires fulfillsModule, that means fulfillsModule
        // fulfills the requirements for module
        fulfillModules[fulfillsModule].add(moduleCode);
      }
    }
  }

  return allModules.map((module) => {
    const moduleCode = module.ModuleCode;

    return {
      ...module,
      PrereqTree: prerequisites[moduleCode],
      FulfillRequirements: Array.from(fulfillModules[moduleCode]),
    };
  });
}

export default async function generatePrereqTree(
  allModules: ModuleWithoutTree[],
): Promise<Module[]> {
  // check that all modules match regex and no modules contain operators
  const moduleCodes: string[] = uniq(allModules.map((module) => module.ModuleCode));

  moduleCodes.forEach((moduleCode) => {
    const isModule = MODULE_REGEX.test(moduleCode);

    if (!isModule) {
      throw new Error(`Module ${moduleCode}'s module code does not match regex.`);
    }

    if (OPERATORS_REGEX.test(moduleCode)) {
      throw new Error(`Module ${moduleCode}'s module code contains operators.`);
    }
  });

  const prerequisites = parse(allModules, logger);
  const modules = generateRequirements(allModules, prerequisites);

  return modules;
}
