import { FETCH_MODULE_LIST, FETCH_MODULE } from 'actions/moduleBank';
import * as RequestResultCases from 'middlewares/requests-middleware';

const defaultModuleBankState = {
  moduleList: [],     // List of modules
  moduleListSelect: [],
  modules: {},       // Object of ModuleCode -> ModuleDetails
};

function moduleBank(state = defaultModuleBankState, action) {
  switch (action.type) {
    case FETCH_MODULE_LIST + RequestResultCases.SUCCESS:
      return {
        ...state,
        moduleList: action.response,
        moduleListSelect: action.response.map((module) => {
          return {
            value: module.ModuleCode,
            label: `${module.ModuleCode} ${module.ModuleTitle}`,
          };
        }),
      };
    case FETCH_MODULE + RequestResultCases.SUCCESS:
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.response.ModuleCode]: action.response,
        },
      };
    default:
      return state;
  }
}

export default moduleBank;
