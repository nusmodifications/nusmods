import { ShallowWrapper, ReactWrapper } from 'enzyme';

import { ColorIndex } from 'types/timetables';
import { Module } from 'types/modules';
import { ModuleWithColor } from '../types/views';

export function expectColor(element: ReactWrapper | ShallowWrapper, color?: ColorIndex) {
  if (color == null) {
    expect(element.is('[class^="color-"')).toBe(true);
  } else {
    expect(element.hasClass(`color-${color}`)).toBe(true);
  }
}

export function addColors(
  modules: Module[],
  isHiddenInTimetable = false,
  isTaInTimetable = false,
  canTa = false,
): ModuleWithColor[] {
  return modules.map((module, index) => ({
    ...module,
    colorIndex: index,
    isHiddenInTimetable,
    isTaInTimetable,
    canTa,
  }));
}
