// @flow

import { values, omit, isEqual } from 'lodash';

import type { Task } from '../types/tasks';
import type { ModuleWithoutTree, SemesterModuleData } from '../types/mapper';
import type { Module, ModuleCode, ModuleCondensed, ModuleInformation } from '../types/modules';

import BaseTask from './BaseTask';
import config from '../config';
import { Logger } from '../services/logger';
import genReqTree from '../services/requisite-tree';

type Input = SemesterModuleData[][];
type Output = Module[];

/**
 * Combine modules from multiple semesters into one
 */
export function combineModules(
  semesters: SemesterModuleData[][],
  logger: Logger,
): ModuleWithoutTree[] {
  const modules: { [ModuleCode]: ModuleWithoutTree } = {};

  // 1. Iterate over each module
  semesters.forEach((semesterModules) =>
    semesterModules.forEach((module) => {
      if (!modules[module.ModuleCode]) {
        // 2. If the module doesn't exist yet, we'll add it
        modules[module.ModuleCode] = {
          ...module.Module,
          History: [module.SemesterData],
        };
      } else {
        // 3. If the module has been added already then we simply merge the
        //    semester data
        modules[module.ModuleCode].History.push(module.SemesterData);

        // 4. Safety check for diverging module info between semester
        const left = omit(modules[module.ModuleCode], 'SemesterData');
        const right = omit(module, 'SemesterData');
        if (!isEqual(left, right)) {
          const { History } = modules[module.ModuleCode];
          logger.warn(
            { left, right, semesters: [History[0].Semester, module.SemesterData.Semester] },
            'Module with different module info between semesters',
          );
        }
      }
    }),
  );

  return values(modules);
}

const getModuleCondensed = (module: ModuleWithoutTree): ModuleCondensed => ({
  ModuleCode: module.ModuleCode,
  ModuleTitle: module.ModuleTitle,
  Semesters: module.History.map((semester) => semester.Semester),
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
  History,
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
  History: History.map(({ Semester, ExamDate, ExamDuration }) => ({
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

    const modulesWithoutTree: ModuleWithoutTree[] = combineModules(input, this.logger);

    // Insert prerequisite trees into the modules
    const modules: Module[] = await genReqTree(modulesWithoutTree);

    this.logger.info(`Collated ${modules.length} modules`);

    // Save final combined module to their individual files
    await Promise.all(modules.map((module) => this.io.module(module.ModuleCode, module)));

    // Save condensed versions of the same information for searching
    const moduleCondensed = modules.map(getModuleCondensed);
    const moduleInformation = modules.map(getModuleInformation);

    await Promise.all([
      this.io.moduleList(moduleCondensed),
      this.io.moduleInformation(moduleInformation),
    ]);

    return values(modules);
  }
}
