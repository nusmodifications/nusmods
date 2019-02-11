import { mapValues, values, omit, isEqual, mergeWith } from 'lodash';

import { Task } from '../types/tasks';
import { ModuleAliases, ModuleWithoutTree, SemesterModuleData } from '../types/mapper';
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
      const moduleCode = semesterModule.ModuleCode;

      // 2. Create the merged module data
      const module = {
        ...semesterModule.Module,
        Aliases: aliases[moduleCode],
        SemesterData: [semesterModule.SemesterData],
      };

      // 3. On rare occasion the module data can change between semesters,
      //    which we log here for safety
      const existingData = modules[moduleCode];
      if (existingData) {
        const left = omit(existingData, ['SemesterData', 'Aliases']);
        const right = semesterModule.Module;

        if (!isEqual(left, right)) {
          logger.warn(
            {
              left,
              right,
            },
            'Module with different module info between semesters',
          );
        }

        // 4. Always use the latest semester's data. In case the two semester's data
        //    diverge we trust the latest semester's data to be canonical as most
        //    changes are additive, eg. adding more prereq options
        module.SemesterData.unshift(...existingData.SemesterData);
      }

      modules[moduleCode] = module;
    }
  }

  return values(modules);
}

const getModuleCondensed = (module: ModuleWithoutTree): ModuleCondensed => ({
  ModuleCode: module.ModuleCode,
  ModuleTitle: module.ModuleTitle,
  Semesters: module.SemesterData.map((semester) => semester.Semester),
});

// Avoid using _.pick here because it is not type safe
/* eslint-disable no-shadow */
const getModuleInformation = ({
  ModuleCode,
  ModuleTitle,
  ModuleDescription,
  ModuleCredit,
  Department,
  Faculty,
  Workload,
  Prerequisite,
  Preclusion,
  SemesterData,
}: ModuleWithoutTree): ModuleInformation => ({
  ModuleCode,
  ModuleTitle,
  ModuleDescription,
  ModuleCredit,
  Department,
  Faculty,
  Workload,
  Prerequisite,
  Preclusion,
  History: SemesterData.map(({ Semester, ExamDate, ExamDuration }) => ({
    Semester,
    ExamDate,
    ExamDuration,
  })),
});
/* eslint-enable */

/**
 * Collect semester data from multiple semesters together
 *
 * Output:
 *  - modules/<ModuleCode>.json
 *  - moduleInformation.json
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

    // Insert prerequisite trees into the modules
    const modules: Module[] = await generatePrereqTree(modulesWithoutTree);

    this.logger.info(`Collated ${modules.length} modules`);

    // Save final combined module to their individual files
    await Promise.all(modules.map((module) => this.io.module(module.ModuleCode, module)));

    // Save condensed versions of the same information for searching
    const moduleCondensed = modules.map(getModuleCondensed);
    const moduleInformation = modules.map(getModuleInformation);

    await Promise.all([
      this.io.moduleList(moduleCondensed),
      this.io.moduleInformation(moduleInformation),
      this.io.moduleAliases(combinedAliases),
    ]);

    return values(modules);
  }
}
