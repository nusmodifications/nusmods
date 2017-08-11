// @flow

import type { Module } from 'types/modules';

export default class ModuleFilter {
  enabled = false;

  label: string;
  test: Module => boolean;
  memoizedCount: number;

  constructor(label: string, test: Module => boolean) {
    this.label = label;
    this.test = test;
  }

  count(modules: Array<Module>, recount: boolean = false) {
    if (!recount && this.memoizedCount !== undefined) return this.memoizedCount;
    return modules.reduce((total, module) => total + this.test(module), 0);
  }
}
