import { flatMap, sortBy, get, values } from 'lodash-es';

import { ModulesMap, TimetablesState } from 'types/reducers';
import { SemTimetableConfig, TimetableConfig } from 'types/timetables';
import { ModuleCode } from 'types/modules';

// Module bank utils - exported separately so this does not become exported as an action creator

// All lesson configs that pin their modules in the module bank: the live
// timetable of every semester, plus every saved slot's snapshot
export function getPinnedLessonConfigs(timetables: TimetablesState): SemTimetableConfig[] {
  return [
    ...values(timetables.lessons),
    ...flatMap(values(timetables.slots), (slots) => slots.map((slot) => slot.data.lessons)),
  ];
}

// Export for testing
export function getLRUModules(
  modules: ModulesMap,
  lessons: TimetableConfig | SemTimetableConfig[],
  currentModule: string,
  toRemove = 1,
): ModuleCode[] {
  // Pull all the modules in all the timetables and saved slots
  const timetableModules = new Set(flatMap(lessons, (semester) => Object.keys(semester)));

  // Remove the module which is least recently used and which is not in timetable
  // and not the currently loaded one
  const canRemove: ModuleCode[] = Object.keys(modules).filter(
    (moduleCode) => moduleCode !== currentModule && !timetableModules.has(moduleCode),
  );

  // Sort them based on the timestamp alone
  const sortedModules = sortBy<ModuleCode>(canRemove, (moduleCode) =>
    get(modules[moduleCode], ['timestamp'], 0),
  );

  return sortedModules.slice(0, toRemove);
}
