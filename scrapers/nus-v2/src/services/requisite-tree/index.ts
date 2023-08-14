import { entries } from 'lodash';

import { Module, ModuleCode, PrereqTree } from '../../types/modules';
import { ModuleWithoutTree } from '../../types/mapper';
import rootLogger, { Logger } from '../logger';

import parseString from './parseString';
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

const GRADE_REQUIREMENT_SEPARATOR = ':';

function parse(data: ModuleWithoutTree[], subLogger: Logger): PrereqTreeMap {
  const results: PrereqTreeMap = {};

  for (const module of data) {
    const { moduleCode, prerequisiteRule: value } = module;

    if (
      // Filter out empty values
      value
    ) {
      const moduleLog = subLogger.child({ moduleCode });

      const parsedValue = parseString(value, moduleLog);

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
    for (const fulfillsModuleString of flattenTree(prereqs)) {
      const fulfillsModule = fulfillsModuleString.includes(GRADE_REQUIREMENT_SEPARATOR)
        ? fulfillsModuleString.split(GRADE_REQUIREMENT_SEPARATOR)[0]
        : fulfillsModuleString;
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
  const prerequisites = parse(allModules, logger);
  const modules = insertRequisiteTree(allModules, prerequisites);

  return modules;
}
