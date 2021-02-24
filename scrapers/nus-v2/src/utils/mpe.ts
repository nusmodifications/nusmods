import { Module } from '../types/modules';

// eslint-disable-next-line import/prefer-default-export
export function isModuleInMPE({ attributes }: Module): boolean {
  return !!attributes?.mpes1 || !!attributes?.mpes2;
}
