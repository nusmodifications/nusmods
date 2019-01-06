// @flow
import { sortBy } from 'lodash';
import { Semesters } from 'types/modules';
import type { AcadYearModules, ModuleTime, PlannerState } from 'types/reducers';
import { getYearsBetween } from 'utils/modules';
import type { ModuleCode, Semester } from 'types/modules';

/* eslint-disable no-useless-computed-key */

export function filterModuleForSemester(
  modules: { +[ModuleCode]: ModuleTime },
  year: string,
  semester: Semester,
) {
  const filteredModules = Object.keys(modules).filter((moduleCode) => {
    const [moduleYear, moduleSemester] = modules[moduleCode];
    return moduleYear === year && moduleSemester === semester;
  });

  return sortBy<ModuleCode>(filteredModules, (moduleCode: ModuleCode) => modules[moduleCode][2]);
}

export function getAcadYearModules(state: PlannerState): AcadYearModules {
  const years = getYearsBetween(state.minYear, state.maxYear);
  const modules = {};

  years.forEach((year) => {
    modules[year] = {};

    Semesters.forEach((semester) => {
      const moduleCodes = filterModuleForSemester(state.modules, year, semester);

      if (moduleCodes.length === 0) {
        if (semester === 1 || semester === 2) {
          modules[year][semester] = [];
        }
        return;
      }

      modules[year][semester] = moduleCodes;
    });
  });

  return modules;
}
