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
import type { MPEModule } from '../types/mpe';

import BaseTask from './BaseTask';
import config from '../config';
import { Logger } from '../services/logger';
import generatePrereqTree from '../services/requisite-tree';
import { union } from '../utils/set';
import { isModuleOffered } from '../utils/data';
import { isModuleInMPE } from '../utils/mpe';

interface Input {
  semesterData: SemesterModuleData[][];
  aliases: ModuleAliases[];
}
type Output = Module[];

/**
 * Merge aliases and convert set to array
 */
export function mergeAliases(aliases: ModuleAliases[]): { [moduleCode: string]: ModuleCode[] } {
  // This version of the function cannot be expressed in TypeScript, so we just cast it to any
  /* eslint-disable consistent-return, @typescript-eslint/ban-types */
  const merged: ModuleAliases = (mergeWith as Function)(
    ...aliases,
    (src: Set<ModuleCode> | undefined, dest: Set<ModuleCode> | undefined) => {
      if (src && dest) return union(src, dest);
      // Returning void causes mergeWith to use the original merge
    },
  );
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
      const module: ModuleWithoutTree = {
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

const getModuleMPEParticipation = ({
  title,
  moduleCode,
  moduleCredit,
  attributes,
}: ModuleWithoutTree): MPEModule => ({
  title,
  moduleCode,
  moduleCredit,
  inS1CPEx: attributes?.mpes1,
  inS2CPEx: attributes?.mpes2,
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
  corequisite,
  semesterData,
  attributes,
  gradingBasisDescription,
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
  corequisite,
  attributes,
  gradingBasisDescription,
  semesterData: semesterData.map(({ semester, examDate, examDuration, covidZones }) => ({
    semester,
    examDate,
    examDuration,
    covidZones,
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

    // Save condensed versions of the same information for searching. For module list we only save
    // offered modules so that they don't go into the add module dropdown
    const moduleCondensed = modules.filter(isModuleOffered).map(getModuleCondensed);

    const mpeModules = modules
      .filter(isModuleOffered)
      .filter(isModuleInMPE)
      .map(getModuleMPEParticipation);

    const moduleInfo = modules.map(getModuleInfo);

    await Promise.all([
      this.io.moduleList(moduleCondensed),
      this.io.mpeModules(mpeModules),
      this.io.moduleInfo(moduleInfo),
      this.io.moduleAliases(combinedAliases),
    ]);

    // DEPRECATED. TODO: Remove after AY19/20 starts.
    const moduleInformation = moduleInfo.filter(isModuleOffered);
    await this.io.moduleInformation(moduleInformation);

    return values(modules);
  }
}
