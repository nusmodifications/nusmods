// @flow

import { values } from 'lodash';
import type { Task } from '../types/tasks';
import type { ModuleWithoutTree, SemesterModuleData } from '../types/mapper';
import type { Module } from '../types/modules';

import BaseTask from './BaseTask';
import config from '../config';
import { combineModules, getModuleCondensed, getModuleInformation } from '../services/mapper';
import genReqTree from '../services/requisite-tree';

type Input = SemesterModuleData[][];
type Output = Module[];

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

  logger = this.rootLogger.child({
    task: CollateModules.name,
    year: this.academicYear,
  });

  get name() {
    return `Collating modules for ${this.academicYear}`;
  }

  constructor(academicYear: string = config.academicYear) {
    super();

    this.academicYear = academicYear;
  }

  async run(input: Input) {
    this.logger.info(`Collating modules for ${this.academicYear}`);

    const modulesWithoutTree: ModuleWithoutTree[] = combineModules(input);

    // Insert prerequisite trees into the modules
    const modules: Module[] = await genReqTree(modulesWithoutTree);

    this.logger.info(`Collated ${modules.length} modules`);

    // Save final combined module to their individual files
    await Promise.all(
      modules.map((module) => this.fs.output.module(module.ModuleCode).write(module)),
    );

    // Save condensed versions of the same information for searching
    const moduleCondensed = modules.map(getModuleCondensed);
    const moduleInformation = modules.map(getModuleInformation);

    await Promise.all([
      this.fs.output.moduleList.write(moduleCondensed),
      this.fs.output.moduleInformation.write(moduleInformation),
    ]);

    return values(modules);
  }
}
