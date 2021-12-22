import produce from 'immer';
import { each, max, min, pull } from 'lodash';
import { createMigrate, PersistedState } from 'redux-persist';

import { PlannerState } from 'types/reducers';
import { Actions } from 'types/actions';
import { Semester } from 'types/modules';

import {
  ADD_CUSTOM_PLANNER_DATA,
  ADD_PLANNER_MODULE,
  MOVE_PLANNER_MODULE,
  REMOVE_PLANNER_MODULE,
  SET_PLACEHOLDER_MODULE,
  SET_PLANNER_IBLOCS,
  SET_PLANNER_MAX_YEAR,
  SET_PLANNER_MIN_YEAR,
  SET_PREREQUISITES_CHECK,
} from 'actions/planner';
import { filterModuleForSemester } from 'selectors/planner';
import config from 'config';

const defaultPlannerState: PlannerState = {
  minYear: config.academicYear,
  maxYear: config.academicYear,
  iblocs: false,
  prereqsCheck: true, 

  modules: {},
  custom: {},
};

/**
 * Derive the next ID in PlannerState.modules by incrementing from the last
 * existing ID
 */
export function nextId(modules: PlannerState['modules']): string {
  const ids = Object.keys(modules).map(Number);
  if (ids.length === 0) return '0';
  return String(Math.max(...ids) + 1);
}

/**
 * Get a list of IDs in a specific year and semester, optionally excluding the
 * given ID
 */
function getSemesterIds(
  modules: PlannerState['modules'],
  year: string,
  semester: Semester,
  exclude?: string,
): string[] {
  const ids = filterModuleForSemester(modules, year, semester).map((module) => module.id);
  if (exclude) return pull(ids, exclude);
  return ids;
}

export default function planner(
  state: PlannerState = defaultPlannerState,
  action: Actions,
): PlannerState {
  switch (action.type) {
    case SET_PLANNER_MIN_YEAR:
      return {
        ...state,
        minYear: action.payload,
        maxYear: max([action.payload, state.maxYear]) as string,
      };

    case SET_PLANNER_MAX_YEAR:
      return {
        ...state,
        maxYear: action.payload,
        minYear: min([action.payload, state.minYear]) as string,
      };

    case SET_PLANNER_IBLOCS:
      return { ...state, iblocs: action.payload };

    case SET_PREREQUISITES_CHECK:
      return { ...state, prereqsCheck: action.payload };

    case ADD_PLANNER_MODULE: {
      const { payload } = action;
      const { year, semester } = payload;

      const id = nextId(state.modules);
      const index = getSemesterIds(state.modules, year, semester).length;
      const props =
        payload.type === 'placeholder'
          ? { placeholderId: payload.placeholderId }
          : { moduleCode: payload.moduleCode };

      return produce(state, (draft) => {
        draft.modules[id] = {
          id,
          year,
          semester,
          index,
          ...props,
        };
      });
    }

    case MOVE_PLANNER_MODULE: {
      const { id, year, semester, index } = action.payload;

      // Insert the module into its new location and update the location of
      // all other modules on the list. We exclude the moved module because otherwise
      // a duplicate will be inserted
      const newModuleOrder = getSemesterIds(state.modules, year, semester, id);
      newModuleOrder.splice(index, 0, id);

      // If the module is moved from another year / semester, then we also need
      // to update the index of the old module list
      let oldModuleOrder: string[] = [];
      const { year: oldYear, semester: oldSemester } = state.modules[id];
      if (oldYear !== year || oldSemester !== semester) {
        oldModuleOrder = getSemesterIds(state.modules, oldYear, oldSemester, id);
      }

      // Update the index of all affected modules
      return produce(state, (draft) => {
        draft.modules[id].year = year;
        draft.modules[id].semester = semester;

        newModuleOrder.forEach((newId, order) => {
          draft.modules[newId].index = order;
        });

        oldModuleOrder.forEach((oldId, order) => {
          draft.modules[oldId].index = order;
        });
      });
    }

    case REMOVE_PLANNER_MODULE:
      return produce(state, (draft) => {
        delete draft.modules[action.payload.id];
      });

    case ADD_CUSTOM_PLANNER_DATA:
      return produce(state, (draft) => {
        draft.custom[action.payload.moduleCode] = action.payload.data;
      });

    case SET_PLACEHOLDER_MODULE:
      return produce(state, (draft) => {
        draft.modules[action.payload.id].moduleCode = action.payload.moduleCode;
      });

    default:
      return state;
  }
}

// Migration from state V0 -> V1
type PlannerStateV0 = Omit<PlannerState, 'modules'> & {
  modules: { [moduleCode: string]: [string, Semester, number] };
};
export function migrateV0toV1(
  oldState: PlannerStateV0 & PersistedState,
): PlannerState & PersistedState {
  // Map the old module time mapping of module code to module time tuple
  // to the new mapping of id to module time object
  let id = 0;

  const newModules: PlannerState['modules'] = {};

  each(oldState.modules, ([year, semester, index], moduleCode) => {
    newModules[id] = {
      id: String(id),
      year,
      semester,
      index,
      moduleCode,
    };

    id += 1;
  });

  return {
    ...oldState,
    // Map old ModuleTime type to new PlannerTime shape
    modules: newModules,
  };
}

export const persistConfig = {
  version: 1,
  migrate: createMigrate({
    // The typings for this seems really weird
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    1: migrateV0toV1 as any,
  }),
};
