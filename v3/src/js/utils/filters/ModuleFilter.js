// @flow

import type { Module } from 'types/modules';

export default class ModuleFilter {
  enabled = false;

  id: string;
  label: string;
  test: Module => boolean;

  // Recounting is expensive. Only update it when the list of modules have changed.
  memoizedCount: number;
  prevModules: Module[];

  constructor(id: string, label: string, test: Module => boolean) {
    this.id = id;
    this.label = label;
    this.test = test;
  }

  count(modules: Module[]) {
    if (this.prevModules === modules && this.memoizedCount) return this.memoizedCount;
    this.memoizedCount = modules.reduce((total, module) => total + this.test(module), 0);
    this.prevModules = modules;
    return this.memoizedCount;
  }
}
