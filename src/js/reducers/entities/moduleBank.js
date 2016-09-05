import { GET_MODULE_LIST, GET_MODULE } from 'actions/moduleBank';
import * as RequestResultCases from 'middlewares/requests-middleware';

const defaultModuleBankState = {
  moduleList: [],    // List of modules
  modules: {},       // Object of ModuleCode -> ModuleDetails
};

function moduleBank(state = defaultModuleBankState, action) {
  switch (action.type) {
    case GET_MODULE_LIST + RequestResultCases.SUCCESS:
      return Object.assign({}, state, {
        moduleList: action.response,
      });
    case GET_MODULE + RequestResultCases.SUCCESS:
      return Object.assign({}, state, {
        modules: Object.assign({}, state.modules, {
          [action.response.ModuleCode]: action.response,
        }),
      });
    default:
      return state;
  }
}

export default moduleBank;
