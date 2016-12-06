import path from 'path';
import fs from 'fs-promise';
import bunyan from 'bunyan';
import R from 'ramda';
import parseString from './parseString';
import normalizeString from './normalizeString';
import { OPERATORS_REGEX, MODULE_REGEX } from './constants';

/**
 * Generate the following fields for modules:
 * ParsedPrerequisite: prerequisite in the form of a tree
 * ParsedPreclusion: preclusion in the form of a tree
 * LockedModules: modules that cannot be taken until this module is fulfilled
 * ModmavenTree: different format of ParsedPrerequisite
 */

const log = bunyan.createLogger({
  name: 'genReqTree',
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
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

function parse(key, data, subLog) {
  const generateModulesToKeyMap = R.pipe(
    R.map(R.props(['ModuleCode', key])),
    R.fromPairs, // [key, val] => { key: val }
    R.filter(R.identity),
  );
  const moduleCodeToData = generateModulesToKeyMap(data);

  const filterUnparseable = R.pipe(
    R.filter(str => !RESTRICTED_KEYWORDS.some(keyword => str.includes(keyword))), // remove restricted
    R.filter(R.test(MODULE_REGEX)), // remove those with no modules
  );
  const parsable = filterUnparseable(moduleCodeToData);

  Object.keys(moduleCodeToData).forEach((moduleCode) => {
    if (!Object.prototype.hasOwnProperty.call(parsable, moduleCode)) {
      // log.debug(`${moduleCode}'s ${key} cannot be parsed: ${moduleCodeToData[moduleCode]}`);
    }
  });

  Object.keys(parsable).forEach((moduleCode) => {
    const string = parsable[moduleCode];
    const normalizedString = normalizeString(string, moduleCode);

    const moduleLog = subLog.child({ moduleCode });
    const parsedString = parseString(normalizedString, moduleLog);
    parsable[moduleCode] = parsedString ? {
      [key]: string,
      [`Parsed${key}`]: parsedString,
    } : null;
  });
  const removeNull = R.filter(R.identity);
  return removeNull(parsable);
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
    } else if (Array.isArray(tree)) {
      return tree.map(genModmavenTree);
    }
    return Object.entries(tree).map(([key, val]) => {
      // recursively gen tree
      const children = genModmavenTree(val);
      return node(key, children);
    });
  }
  Object.values(allModules).forEach((module) => {
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
    } else if (Array.isArray(tree)) {
      return R.unnest(tree.map(flattenTree));
    }
    return R.unnest(Object.values(tree).map(flattenTree));
  }
  Object.values(modules).forEach((module) => {
    const thisModuleCode = module.ModuleCode;
    const parsedPrerequisite = module.ParsedPrerequisite || [];
    const flattenedPrerequisites = flattenTree(parsedPrerequisite);
    flattenedPrerequisites.forEach((moduleCode) => {
      if (Object.prototype.hasOwnProperty.call(modules, moduleCode)) {
        modules[moduleCode].LockedModules.add(thisModuleCode);
      }
    });
  });

  // convert set back to array
  moduleCodes.forEach((moduleCode) => {
    modules[moduleCode].LockedModules = [...modules[moduleCode].LockedModules];
  });
  return modules;
}

async function genReqTree(allModules, config) {
  const { year } = config;
  const subLog = log.child({ year });

  // check that all modules match regex and no modules contain operators
  const moduleCodes = R.uniq(R.pluck('ModuleCode', allModules));
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

  const prerequisites = parse('Prerequisite', allModules, subLog);
  const preclusions = parse('Preclusion', allModules, subLog);
  const merged = allModules.map((data) => {
    const moduleCode = data.ModuleCode;
    const mergedPrerequisite = R.merge(data, prerequisites[moduleCode]);
    const mergedPreclusion = R.merge(mergedPrerequisite, preclusions[moduleCode]);
    return mergedPreclusion;
  });
  const modules = generateRequirements(merged, moduleCodes);

  // for debugging usage
  if (process.env.NODE_ENV === 'development') {
    const debugOutput = R.map(R.pick([
      'Prerequisite',
      'ParsedPrerequisite',
      'Preclusion',
      'ParsedPreclusion',
      'ModmavenTree',
      'LockedModules',
    ]), modules);

    const pathToWrite = path.join(
      config.destFolder,
      `${year}-${year + 1}`,
      'reqTree.json',
    );
    subLog.debug(`saving to ${pathToWrite}`);
    await fs.outputJson(pathToWrite, debugOutput, { spaces: config.jsonSpace });
  }

  return Object.values(modules);
}

export default genReqTree;
