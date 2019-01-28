// @flow

import { pick, values } from 'lodash';

import type { Task } from '../types/tasks';
import type { ModuleWithoutTree, SemesterModuleData } from '../types/mapper';
import type { Module, ModuleCode, ModuleCondensed, ModuleInformation } from '../types/modules';

import BaseTask from './BaseTask';
import config from '../config';
import genReqTree from '../services/requisite-tree';

type Input = SemesterModuleData[][];
type Output = Module[];

/**
 * Combine modules from multiple semesters into one
 */
export function combineModules(semesters: SemesterModuleData[][]) {
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
        // 3. If it does then we simply append the semester data
        modules[module.ModuleCode].History.push(module.SemesterData);
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

const getModuleInformation = (module: ModuleWithoutTree): ModuleInformation => {
  const History = module.History.map((semester) =>
    pick(semester, ['Semester', 'ExamDate', 'ExamDuration']),
  );

  const moduleInformation = pick(module, [
    'ModuleCode',
    'ModuleTitle',
    'ModuleDescription',
    'ModuleCredit',
    'Department',
    'Workload',
    'Prerequisite',
    'Preclusion',
  ]);

  return {
    ...moduleInformation,
    History,
  };
};

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
    super();

    this.academicYear = academicYear;
    this.logger = this.rootLogger.child({
      task: CollateModules.name,
      year: academicYear,
    });
  }

  async run(input: Input) {
    this.logger.info(`Collating modules for ${this.academicYear}`);

    const modulesWithoutTree: ModuleWithoutTree[] = combineModules(input);

    // Insert prerequisite trees into the modules
    const modules: Module[] = await genReqTree(modulesWithoutTree);

    this.logger.info(`Collated ${modules.length} modules`);

    // Save final combined module to their individual files
    await Promise.all(modules.map((module) => this.output.module(module.ModuleCode, module)));

    // Save condensed versions of the same information for searching
    const moduleCondensed = modules.map(getModuleCondensed);
    const moduleInformation = modules.map(getModuleInformation);

    await Promise.all([
      this.output.moduleList(moduleCondensed),
      this.output.moduleInformation(moduleInformation),
    ]);

    return values(modules);
  }
}
