// @flow

import path from 'path';
import { values } from 'lodash';
import * as fs from 'fs-extra';
import * as R from 'ramda';

import type { ModuleWithoutTree } from '../../types/mapper';
import rootLogger, { Logger } from '../logger';
import config from '../../config';
import parseString from './parseString';
import normalizeString from './normalizeString';
import { MODULE_REGEX, OPERATORS_REGEX } from './constants';

/**
 * Generate the following fields for modules:
 * ParsedPrerequisite: prerequisite in the form of a tree
 * ParsedPreclusion: preclusion in the form of a tree
 * LockedModules: modules that cannot be taken until this module is fulfilled
 * ModmavenTree: different format of ParsedPrerequisite
 */

const logger = rootLogger.child({
  service: 'requisite-tree',
});

// Add any key-words and reasons for which NO parsing should be done and
// the entire pre-req string should be shown instead
const RESTRICTED_KEYWORDS = [
  // requirement to be USP students cannot be represented
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

function parse(key: 'Prerequisite' | 'Preclusion', data: ModuleWithoutTree[], subLogger: Logger) {
  const moduleCodeToData: { [string]: string } = R.pipe(
    R.map(R.props(['ModuleCode', key])),
    R.fromPairs, // [key, val] => { key: val }
    R.filter(R.identity),
  )(data);

  const parsable = R.pipe(
    // remove restricted
    R.filter((str) => !RESTRICTED_KEYWORDS.some((keyword) => str.includes(keyword))),
    // remove those with no modules
    R.filter(R.test(MODULE_REGEX)),
  )(moduleCodeToData);

  Object.keys(parsable).forEach((moduleCode) => {
    const string = parsable[moduleCode];
    const normalizedString = normalizeString(string, moduleCode);

    const moduleLog = subLogger.child({ moduleCode });
    const parsedString = parseString(normalizedString, moduleLog);

    parsable[moduleCode] = parsedString
      ? {
          [key]: string,
          [`Parsed${key}`]: parsedString,
        }
      : null;
  });

  return R.filter(R.identity, parsable);
}

function generateRequirements(allModules, moduleCodes) {
  const modules = {};

  // converts { key: val } turns into { name: key, children: val }
  function node(key, val) {
    return { name: key, children: val };
  }

  function genModmavenTree(tree) {
    if (typeof tree === 'string') {
      return node(tree, []);
    }

    if (Array.isArray(tree)) {
      return tree.map(genModmavenTree);
    }

    return Object.entries(tree).map(([key, val]) => {
      // recursively gen tree
      const children = genModmavenTree(val);
      return node(key, children);
    });
  }

  values(allModules).forEach((module) => {
    const moduleCode = module.ModuleCode;
    const parsedPrerequisite = genModmavenTree(module.ParsedPrerequisite || []);
    modules[moduleCode] = {
      ...module,
      ModmavenTree: node(moduleCode, parsedPrerequisite),
    };
  });

  // locked modules mean 'inverse prerequisite', or
  // 'if you have not taken this module, you cannot take the following'

  // inject 'LockedModules' key into every module as a set
  moduleCodes.forEach((moduleCode) => {
    modules[moduleCode].LockedModules = new Set();
  });

  function flattenTree(tree) {
    if (typeof tree === 'string') {
      return [tree];
    }

    return Array.isArray(tree)
      ? R.unnest(tree.map(flattenTree))
      : R.unnest(Object.values(tree).map(flattenTree));
  }

  values(modules).forEach((module) => {
    const thisModuleCode = module.ModuleCode;
    const parsedPrerequisite = module.ParsedPrerequisite || [];
    const flattenedPrerequisites = flattenTree(parsedPrerequisite);
    flattenedPrerequisites.forEach((moduleCode) => {
      if (modules[moduleCode]) {
        modules[moduleCode].LockedModules.add(thisModuleCode);
      }
    });
  });

  // convert set back to array
  moduleCodes.forEach((moduleCode) => {
    modules[moduleCode].LockedModules = Array.from(modules[moduleCode].LockedModules);
  });

  return modules;
}

export default async function genReqTree(allModules: ModuleWithoutTree[]) {
  // check that all modules match regex and no modules contain operators
  const moduleCodes: string[] = R.uniq(R.pluck('ModuleCode', allModules));

  moduleCodes.forEach((moduleCode) => {
    const isModule = MODULE_REGEX.test(moduleCode);
    if (!isModule) {
      throw new Error(`Module ${moduleCode}'s module code does not match regex.`);
    }

    const hasOperators = OPERATORS_REGEX.test(moduleCode);

    if (hasOperators) {
      throw new Error(`Module ${moduleCode}'s module code contains operators.`);
    }
  });

  const prerequisites = parse('Prerequisite', allModules, logger);
  const preclusions = parse('Preclusion', allModules, logger);

  const merged = allModules.map((data) => {
    const moduleCode = data.ModuleCode;
    const mergedPrerequisite = R.mergeRight(data, prerequisites[moduleCode]);
    const mergedPreclusion = R.mergeRight(mergedPrerequisite, preclusions[moduleCode]);
    return mergedPreclusion;
  });

  const modules = generateRequirements(merged, moduleCodes);

  // for debugging usage
  if (process.env.NODE_ENV === 'development') {
    const debugOutput = R.map(
      R.pick([
        'Prerequisite',
        'ParsedPrerequisite',
        'Preclusion',
        'ParsedPreclusion',
        'ModmavenTree',
        'LockedModules',
      ]),
      modules,
    );

    const pathToWrite = path.join(config.dataPath, config.academicYear, 'reqTree.json');
    await fs.outputJson(pathToWrite, debugOutput, { spaces: 2 });
  }

  return values(modules);
}
