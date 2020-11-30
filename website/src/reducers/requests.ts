import { Requests, FAILURE, REQUEST, SUCCESS } from 'types/reducers';
import { API_REQUEST } from 'actions/requests';

/**
 * Flux Standard Action: https://github.com/acdlite/flux-standard-action
 * @deprecated Use Actions from types/actions instead
 */
type FSA = {
  type: string;
  payload: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  meta?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: boolean;
};

export default function requests(state: Requests = {}, action: FSA): Requests {
  const { meta } = action;

  // requestStatus is a field specially designed and owned by api request actions
  if (!meta || !meta.requestStatus || !meta[API_REQUEST]) {
    return state;
  }

  const key = meta[API_REQUEST];

  switch (meta.requestStatus) {
    case REQUEST:
      return {
        ...state,
        [key]: {
          status: REQUEST,
        },
      };

    case SUCCESS:
      return {
        ...state,
        [key]: {
          status: SUCCESS,
        },
      };

    case FAILURE:
      return {
        ...state,
        [key]: {
          status: FAILURE,
          error: action.payload,
        },
      };

    default:
      return state;
  }
}
