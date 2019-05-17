import { mapValues, values, pick, mergeWith, sortBy } from 'lodash';
import { diff } from 'deep-diff';

import { Task } from '../types/tasks';
import {
  ModuleAliases,
  ModuleWithoutTree,
  SemesterModule,
  SemesterModuleData,
} from '../types/mapper';
import { Module, ModuleCode, ModuleCondensed, ModuleInformation } from '../types/modules';

import BaseTask from './BaseTask';
import config from '../config';
import { Logger } from '../services/logger';
import generatePrereqTree from '../services/requisite-tree';
import { union } from '../utils/set';

interface Input {
  semesterData: SemesterModuleData[][];
  aliases: ModuleAliases[];
}
type Output = Module[];

/**
 * Merge aliases and convert set to array
 */
export function mergeAliases(aliases: ModuleAliases[]): { [moduleCode: string]: ModuleCode[] } {
  // Returning undefined causes mergeWith to use the original merge

  /* eslint-disable consistent-return */
  // @ts-ignore mergeWith allows multiple objects to be merged, but the libdef doesn't
  const merged: ModuleAliases = mergeWith(...aliases, (src, dest) => {
    if (src && dest) return union(src, dest);
  });
  /* eslint-enable */

  // Convert the set to an array to make it easier to output since JSON doesn't
  // encode Sets by default
  return mapValues(merged, (set) => Array.from(set));
}

/**
 * Check that the module info match between the previous semester's module info
 * and the next semester's info. Discrepancy would mean that the module's data
 * has been updated between semesters, which would be a source of error because
 * we assume that the data does not differ, and when it does showing the latest
 * semester's data is correct.
 *
 * This function returns null if the two agree, otherwise it returns an object
 * containing the keys that don't.
 */
export function moduleDataCheck(
  module: ModuleWithoutTree,
  semesterModule: SemesterModule,
): { left: unknown; right: unknown } | null {
  const { semesterData, aliases, ...existing } = module;

  const difference = diff(existing, semesterModule);
  if (!difference) return null;

  const keys = difference.map((edit): string => edit.path && edit.path[0]);
  return {
    left: pick(module, keys),
    right: pick(semesterModule, keys),
  };
}

/**
 * Combine modules from multiple semesters into one
 */
export function combineModules(
  semesters: SemesterModuleData[][],
  aliases: { [moduleCode: string]: ModuleCode[] },
  logger: Logger,
): ModuleWithoutTree[] {
  const modules: { [moduleCode: string]: ModuleWithoutTree } = {};

  // 1. Iterate over each module
  for (const semesterModules of semesters) {
    for (const semesterModule of semesterModules) {
      const { moduleCode, semesterData } = semesterModule;

      // 2. Create the merged module data
      const module = {
        ...semesterModule.module,
        aliases: aliases[moduleCode],
        semesterData: semesterData ? [semesterData] : [],
      };

      // 3. On rare occasion the module data can change between semesters,
      //    which we log here for safety
      const existingData = modules[moduleCode];
      if (existingData) {
        const difference = moduleDataCheck(existingData, semesterModule.module);

        if (difference) {
          logger.warn(difference, 'Module with different module info between semesters');
        }

        // 4. Always use the latest semester's data. In case the two semester's data
        //    diverge we trust the latest semester's data to be canonical as most
        //    changes are additive, eg. adding more prereq options
        module.semesterData.unshift(...existingData.semesterData);
      }

      modules[moduleCode] = module;
    }
  }

  return values(modules);
}

const getModuleCondensed = ({
  moduleCode,
  title,
  semesterData,
}: ModuleWithoutTree): ModuleCondensed => ({
  moduleCode,
  title,
  semesters: semesterData.map((semester) => semester.semester),
});

// Avoid using _.pick here because it is not type safe
const getModuleInfo = ({
  moduleCode,
  title,
  description,
  moduleCredit,
  department,
  faculty,
  workload,
  prerequisite,
  preclusion,
  semesterData,
  attributes,
}: ModuleWithoutTree): ModuleInformation => ({
  moduleCode,
  title,
  description,
  moduleCredit,
  department,
  faculty,
  workload,
  prerequisite,
  preclusion,
  attributes,
  semesterData: semesterData.map(({ semester, examDate, examDuration }) => ({
    semester,
    examDate,
    examDuration,
  })),
});

/**
 * Collect semester data from multiple semesters together
 *
 * Output:
 *  - modules/<ModuleCode>.json
 *  - moduleInformation.json // DEPRECATED. TODO: Remove after AY19/20 starts
 *  - moduleInfo.json
 *  - moduleList.json
 */
export default class CollateModules extends BaseTask implements Task<Input, Output> {
  academicYear: string;

  get name() {
    return `Collating modules for ${this.academicYear}`;
  }

  constructor(academicYear: string = config.academicYear) {
    super(academicYear);

    this.academicYear = academicYear;
    this.logger = this.rootLogger.child({
      task: CollateModules.name,
      year: academicYear,
    });
  }

  async run(input: Input) {
    this.logger.info(`Collating modules for ${this.academicYear}`);

    const { semesterData, aliases } = input;
    const combinedAliases = mergeAliases(aliases);
    const modulesWithoutTree: ModuleWithoutTree[] = combineModules(
      semesterData,
      combinedAliases,
      this.logger,
    );

    // Insert prerequisite trees into the modules and order them by module code
    const unsortedModules: Module[] = await generatePrereqTree(modulesWithoutTree);
    const modules = sortBy(unsortedModules, (module) => module.moduleCode);

    this.logger.info(`Collated ${modules.length} modules`);

    // Save final combined module to their individual files
    await Promise.all(modules.map((module) => this.io.module(module.moduleCode, module)));

    // Save condensed versions of the same information for searching
    const moduleCondensed = modules.map(getModuleCondensed);
    const moduleInfo = modules.map(getModuleInfo);

    await Promise.all([
      this.io.moduleList(moduleCondensed),
      this.io.moduleInfo(moduleInfo),
      this.io.moduleAliases(combinedAliases),
    ]);

    // DEPRECATED. TODO: Remove after AY19/20 starts.
    if (config.academicYear === '2018/2019') {
      const moduleInformation = moduleInfo.filter((modInfo) => modInfo.semesterData.length > 0);
      await this.io.moduleInformation(moduleInformation);
    }

    return values(modules);
  }
}
