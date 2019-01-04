// @flow
import { each } from 'lodash';
import type { AcadYearModules, PlannerState } from 'types/reducers';
import { getYearsBetween } from 'utils/modules';

/* eslint-disable no-useless-computed-key */

// eslint-disable-next-line import/prefer-default-export
export function getAcadYearModules(state: PlannerState): AcadYearModules {
  const years = getYearsBetween(state.minYear, state.maxYear);

  const modules = {};
  years.forEach((year) => {
    modules[year] = {
      [1]: [],
      [2]: [],
    };
  });

  each(state.modules, (value, moduleCode) => {
    const [year, semester] = value;
    if (!modules[year][semester]) modules[year][semester] = [];
    modules[year][semester].push(moduleCode);
  });

  return modules;
}
