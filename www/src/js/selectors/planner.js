// @flow
import { sortBy, toPairs } from 'lodash';
import { Semesters } from 'types/modules';
import type { AcadYearModules, PlannerState } from 'types/reducers';
import { getYearsBetween } from 'utils/modules';

/* eslint-disable no-useless-computed-key */

// eslint-disable-next-line import/prefer-default-export
export function getAcadYearModules(state: PlannerState): AcadYearModules {
  const years = getYearsBetween(state.minYear, state.maxYear);
  const moduleItems = toPairs(state.modules);
  const modules = {};

  years.forEach((year) => {
    modules[year] = {};

    Semesters.forEach((semester) => {
      const filteredModuleItems = moduleItems.filter(([, timings]) => {
        const [moduleYear, moduleSemester] = timings;
        return moduleYear === year && moduleSemester === semester;
      });

      if (filteredModuleItems.length === 0) {
        if (semester === 1 || semester === 2) {
          modules[year][semester] = [];
        }
        return;
      }

      modules[year][semester] = sortBy(filteredModuleItems, ([, timings]) => timings[2]).map(
        ([moduleCode]) => moduleCode,
      );
    });
  });

  return modules;
}
