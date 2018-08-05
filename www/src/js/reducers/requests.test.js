import requests from './requests';
import { API_REQUEST, FAILURE, REQUEST, SUCCESS } from 'middlewares/requests-middleware';

describe(requests, () => {
  const DEFAULT_STATE = {};

  const requestAction = {
    type: 'TEST_ACTION_REQUEST',
    meta: {
      [API_REQUEST]: 'TEST_ACTION',
      requestStatus: REQUEST,
    },
  };

  const successAction = {
    type: 'TEST_ACTION_SUCCESS',
    meta: {
      [API_REQUEST]: 'TEST_ACTION',
      requestStatus: SUCCESS,
    },
  };

  const failureAction = {
    type: 'TEST_ACTION_FAILURE',
    meta: {
      [API_REQUEST]: 'TEST_ACTION',
      requestStatus: FAILURE,
    },
  };

  it('should store requests', () => {
    const next = requests(DEFAULT_STATE, requestAction);

    expect(next).toEqual({
      TEST_ACTION: {
        isPending: true,
        isSuccessful: false,
        isFailure: false,
      },
    });
  });
});
