import axios, { AxiosInstance } from 'axios';
import { Middleware } from 'redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import { FAILURE, REQUEST, SUCCESS } from 'types/reducers';
import { API_REQUEST, RequestsDispatchExt } from 'actions/requests';
import requestMiddleware from './requests-middleware';

jest.mock('axios');
const mockAxios: jest.Mocked<AxiosInstance> = axios as any;

describe(requestMiddleware, () => {
  const mockStore = configureStore<unknown, RequestsDispatchExt>([requestMiddleware as Middleware]);
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
  let store: MockStoreEnhanced<unknown, RequestsDispatchExt>;

  beforeEach(() => {
    store = mockStore();

    mockAxios.request.mockClear();
  });

  it('should make async calls and dispatch actions on success', async () => {
    mockAxios.request.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      data: {
        hello: 'world',
      },
      headers: {
        'content-type': 'application/json',
      },
      config: {},
    });

    await store.dispatch(requestAction);

    expect(mockAxios.request).toBeCalledTimes(1);

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
    mockAxios.request.mockRejectedValueOnce(error);

    const p = store.dispatch(requestAction);
    await expect(p).rejects.toEqual(error);

    expect(mockAxios.request).toBeCalledTimes(1);

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
