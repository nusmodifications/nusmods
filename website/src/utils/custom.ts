import { Module } from 'types/modules';
import { CustomModuleLesson, Lesson } from 'types/timetables';

const CUSTOM_IDENTIFIER = 'custom=';

export function appendCustomIdentifier(moduleCode: string): string {
  return `${CUSTOM_IDENTIFIER}${moduleCode}`;
}

export function removeCustomIdentifier(customModuleCode: string): string {
  return customModuleCode.replace(CUSTOM_IDENTIFIER, '');
}

export function cretaeCustomModule(customModuleCode: string, title: string): Module {
  return {
    moduleCode: customModuleCode,
    title,
    isCustom: true,
    acadYear: '',
    moduleCredit: '0',
    department: '',
    faculty: '',
    semesterData: [],
    timestamp: 0,
  };
}

export function createLesson(customModuleData: CustomModuleLesson): Lesson {
  return {
    ...customModuleData,
    classNo: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  };
}
