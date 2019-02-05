// @flow

import axios from 'axios';
import configureStore from 'redux-mock-store';
import { FAILURE, REQUEST, SUCCESS } from 'types/reducers';
import { API_REQUEST } from 'actions/requests';
import requestMiddleware from './requests-middleware';

// Note: Flow does not understand mocks, so all calls to .mock* functions need to
// use $FlowFixMe comments so that Flow will not raise "method not found" errors
jest.mock('axios');

describe(requestMiddleware, () => {
  const mockStore = configureStore([requestMiddleware]);
  const requestAction = {
    type: 'TEST_ACTION',
    payload: {
      method: 'GET',
      url: 'http://example.com',
    },
    meta: {
      [API_REQUEST]: 'TEST_ACTION',
    },
  };
  let store;

  beforeEach(() => {
    store = mockStore();

    // $FlowFixMe
    axios.mockClear();
  });

  it('should make async calls and dispatch actions on success', async () => {
    // $FlowFixMe
    axios.mockReturnValue(
      Promise.resolve({
        data: {
          hello: 'world',
        },
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    await store.dispatch(requestAction);

    expect(axios).toBeCalledTimes(1);

    expect(store.getActions()).toMatchObject([
      {
        type: 'TEST_ACTION_REQUEST',
        meta: {
          requestStatus: REQUEST,
        },
      },
      {
        type: 'TEST_ACTION_SUCCESS',
        payload: {
          hello: 'world',
        },
        meta: {
          responseHeaders: {
            'content-type': 'application/json',
          },
          requestStatus: SUCCESS,
        },
      },
    ]);
  });

  it('should dispatch error on failure', async () => {
    const error = new Error('The server is on fire');
    // $FlowFixMe
    axios.mockReturnValue(Promise.reject(error));

    const p = store.dispatch(requestAction);
    await expect(p).rejects.toEqual(error);

    expect(axios).toBeCalledTimes(1);

    expect(store.getActions()).toMatchObject([
      {
        type: 'TEST_ACTION_REQUEST',
        meta: {
          requestStatus: REQUEST,
        },
      },
      {
        type: 'TEST_ACTION_FAILURE',
        payload: error,
        meta: {
          requestStatus: FAILURE,
        },
      },
    ]);
  });
});
