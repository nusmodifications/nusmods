import { flatMap, sortBy, get } from 'lodash';

import { ModulesMap } from 'types/reducers';
import { TimetableConfig } from 'types/timetables';
import { ModuleCode } from 'types/modules';

// Module bank utils - exported separately so this does not become exported as an action creator

// Export for testing
// eslint-disable-next-line import/prefer-default-export
export function getLRUModules(
  modules: ModulesMap,
  lessons: TimetableConfig,
  currentModule: string,
  toRemove = 1,
): ModuleCode[] {
  // Pull all the modules in all the timetables
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
