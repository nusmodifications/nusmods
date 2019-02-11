import { API_REQUEST } from 'actions/requests';
import { FAILURE, REQUEST, SUCCESS } from 'types/reducers';
import requests from './requests';

describe(requests, () => {
  const DEFAULT_STATE = {};

  const requestAction = {
    type: 'TEST_ACTION_REQUEST',
    meta: {
      [API_REQUEST]: 'TEST_ACTION',
      requestStatus: REQUEST,
    },
    payload: 'Something',
  };

  const successAction = {
    type: 'TEST_ACTION_SUCCESS',
    meta: {
      [API_REQUEST]: 'TEST_ACTION',
      payload: {
        data: 'Hello world',
      },
      requestStatus: SUCCESS,
    },
    payload: 'Something',
  };

  const failureError = new Error('Test error');
  const failureAction = {
    type: 'TEST_ACTION_FAILURE',
    payload: failureError,
    meta: {
      [API_REQUEST]: 'TEST_ACTION',
      requestStatus: FAILURE,
    },
  };

  it('should store requests', () => {
    const next = requests(DEFAULT_STATE, requestAction);

    expect(next).toEqual({
      TEST_ACTION: {
        status: '_REQUEST',
      },
    });
  });

  it('should store failures', () => {
    const next = requests(DEFAULT_STATE, failureAction);

    expect(next).toEqual({
      TEST_ACTION: {
        status: '_FAILURE',
        error: failureError,
      },
    });
  });

  it('should store success', () => {
    const next = requests(DEFAULT_STATE, successAction);

    expect(next).toEqual({
      TEST_ACTION: {
        status: '_SUCCESS',
      },
    });
  });
});
