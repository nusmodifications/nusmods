import { GET_MODULE_LIST } from 'actions/reddit';
import * as RequestResultCases from 'middlewares/requests-middleware';

function moduleList(state = [], action) {
  switch (action.type) {
    case GET_MODULE_LIST + RequestResultCases.SUCCESS:
      return action.response.data;
    default:
      return state;
  }
}

export default moduleList;
