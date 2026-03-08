import { Module } from '../types/modules';

export function isModuleInMPE({ attributes }: Module): boolean {
  return Boolean(attributes?.mpes1 || attributes?.mpes2);
}
