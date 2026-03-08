import type { Mocked } from 'vitest';
import axios from 'axios';
import { NusApi, callApi, callV1Api } from './nus-api';
import { AuthError, NotFoundError, UnknownApiError } from '../utils/errors';
import { mockResponse } from '../utils/test-utils';

const mockedAxios: Mocked<typeof axios> = axios as any;

beforeEach(() => {
  vi.spyOn(axios, 'get');
});

afterEach(() => {
  mockedAxios.get.mockRestore();
});

describe(callV1Api, () => {
  test('should return data if everything is okay', async () => {
    mockedAxios.get.mockResolvedValue(
      mockResponse({ code: '00000', data: 'Turn down for whaaaaat?', msg: '' }),
    );

    const result = callV1Api('test', {}, {});
    await expect(result).resolves.toEqual('Turn down for whaaaaat?');
  });

  test('should throw auth error', async () => {
    mockedAxios.get.mockResolvedValue(
      mockResponse({ code: '10000', data: [], msg: 'Incorrect user key' }),
    );

    const result = callV1Api('test', {}, {});
    await expect(result).rejects.toBeInstanceOf(AuthError);
    await expect(result).rejects.toHaveProperty('message', 'Incorrect user key');
    await expect(result).rejects.toHaveProperty('response');
  });

  test('should throw not found error', async () => {
    mockedAxios.get.mockResolvedValue(
      mockResponse({ code: '10001', data: [], msg: 'Record not found' }),
    );

    const result = callV1Api('test', {}, {});
    await expect(result).rejects.toBeInstanceOf(NotFoundError);
    await expect(result).rejects.toHaveProperty('message', 'Record not found');
    await expect(result).rejects.toHaveProperty('response');
  });

  test('should throw on unknown error', async () => {
    mockedAxios.get.mockResolvedValue(
      mockResponse({ code: '20000', data: [], msg: 'The server is on fire' }),
    );

    const result = callV1Api('test', {}, {});
    await expect(result).rejects.toBeInstanceOf(UnknownApiError);
    await expect(result).rejects.toHaveProperty('message', 'The server is on fire');
    await expect(result).rejects.toHaveProperty('response');
  });
});

describe(callApi, () => {
  test('should throw if the server returns non-200 response', async () => {
    const config = {
      data: '{"hello": 200}',
      method: 'get',
      url: 'http://api.example.com',
    };

    mockedAxios.get.mockRejectedValue({
      config,
      response: mockResponse('The server is on fire', { status: 500 }),
    });

    const result = callApi('test', {}, {});
    await expect(result).rejects.toBeInstanceOf(UnknownApiError);
    await expect(result).rejects.toHaveProperty(
      'message',
      'Server returned status 500 - Internal Server Error',
    );
    await expect(result).rejects.toHaveProperty('response.data', 'The server is on fire');
  });

  test('should throw if the request could not be made', async () => {
    const config = {
      data: '{"hello": 200}',
      method: 'get',
      url: 'http://api.example.com',
    };

    mockedAxios.get.mockRejectedValue({
      config,
    });

    const result = callApi('test', {}, {});
    await expect(result).rejects.toBeInstanceOf(UnknownApiError);
    await expect(result).rejects.toHaveProperty('requestConfig', config);
  });
});

describe(NusApi, () => {
  test('should enforce maximum concurrency', async () => {
    expect.assertions(7);

    mockedAxios.get.mockResolvedValue(
      mockResponse({ code: '00000', data: 'Turn down for whaaaaat?', msg: '' }),
    );

    const api = new NusApi(2);

    const p1 = api.callApi('test-1', {}, {});
    const p2 = api.callApi('test-2', {}, {});
    const p3 = api.callApi('test-3', {}, {});
    const p4 = api.callApi('test-4', {}, {});

    // Expect 2 requests to have started, with 2 more waiting to be started.
    expect(mockedAxios.get).toBeCalledTimes(2);
    expect(api.queue.getPendingLength()).toEqual(2);
    expect(api.queue.getQueueLength()).toEqual(2);

    await p1;
    await p2;

    // Expect remaining 2 requests to have started.
    expect(mockedAxios.get).toBeCalledTimes(4);
    expect(api.queue.getQueueLength()).toEqual(0);

    await p3;
    await p4;

    // Expect no more pending requests.
    expect(api.queue.getPendingLength()).toEqual(0);
    expect(api.queue.getQueueLength()).toEqual(0);
  });
});
