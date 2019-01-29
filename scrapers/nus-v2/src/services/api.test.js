// @flow

import axios from 'axios';
import { API, callApi } from './api';
import { AuthError, NotFoundError, UnknownApiError } from '../utils/errors';
import { mockResponse } from '../utils/test-utils';

beforeEach(() => {
  // $FlowFixMe Flow doesn't allow these class methods to be overwritten
  axios.post = jest.fn();
});

afterEach(() => {
  axios.post.mockRestore();
});

describe(callApi, () => {
  test('should return data if everything is okay', async () => {
    axios.post.mockResolvedValue(
      mockResponse({ code: '00000', msg: '', data: 'Turn down for whaaaaat?' }),
    );

    const result = await callApi('test', {});
    expect(result).toEqual('Turn down for whaaaaat?');
  });

  test('should throw auth error', async () => {
    axios.post.mockResolvedValue(
      mockResponse({ code: '10000', msg: 'Incorrect user key', data: [] }),
    );

    const result = callApi('test', {});
    await expect(result).rejects.toBeInstanceOf(AuthError);
    await expect(result).rejects.toHaveProperty('message', 'Incorrect user key');
    await expect(result).rejects.toHaveProperty('response');
  });

  test('should throw not found error', async () => {
    axios.post.mockResolvedValue(
      mockResponse({ code: '10001', msg: 'Record not found', data: [] }),
    );

    const result = callApi('test', {});
    await expect(result).rejects.toBeInstanceOf(NotFoundError);
    await expect(result).rejects.toHaveProperty('message', 'Record not found');
    await expect(result).rejects.toHaveProperty('response');
  });

  test('should throw on unknown error', async () => {
    axios.post.mockResolvedValue(
      mockResponse({ code: '20000', msg: 'The server is on fire', data: [] }),
    );

    const result = callApi('test', {});
    await expect(result).rejects.toBeInstanceOf(UnknownApiError);
    await expect(result).rejects.toHaveProperty('message', 'The server is on fire');
    await expect(result).rejects.toHaveProperty('response');
  });

  test('should throw if the server returns non-200 response', async () => {
    const config = {
      url: 'http://api.example.com',
      method: 'post',
      data: '{"hello": 200}',
    };

    axios.post.mockRejectedValue({
      config,
      response: mockResponse('The server is on fire', { status: 500 }),
    });

    const result = callApi('test', {});
    await expect(result).rejects.toBeInstanceOf(UnknownApiError);
    await expect(result).rejects.toHaveProperty(
      'message',
      'Server returned status 500 - Internal Server Error',
    );
    await expect(result).rejects.toHaveProperty('response.data', 'The server is on fire');
  });

  test('should throw if the request could not be made', async () => {
    const config = {
      url: 'http://api.example.com',
      method: 'post',
      data: '{"hello": 200}',
    };

    axios.post.mockRejectedValue({
      config,
    });

    const result = callApi('test', {});
    await expect(result).rejects.toBeInstanceOf(UnknownApiError);
    await expect(result).rejects.toHaveProperty('requestConfig', config);
  });
});

describe(API, () => {
  test('should enforce maximum concurrency', async () => {
    axios.post.mockResolvedValue(
      mockResponse({ code: '00000', msg: '', data: 'Turn down for whaaaaat?' }),
    );

    const api = new API(2);

    const p1 = api.callApi('test-1', {});
    const p2 = api.callApi('test-2', {});
    const p3 = api.callApi('test-3', {});
    const p4 = api.callApi('test-4', {});

    expect(axios.post).toBeCalledTimes(2);
    expect(api.queue.pendingPromises).toEqual(2);

    await p1;
    await p2;

    expect(axios.post).toBeCalledTimes(4);
    expect(api.queue.pendingPromises).toEqual(2);

    await p3;
    await p4;

    expect(api.queue.pendingPromises).toEqual(0);
  });
});
