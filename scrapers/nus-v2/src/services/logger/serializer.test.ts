import type { AxiosRequestConfig } from 'axios';
import { errorSerializer } from './serializer';
import { UnknownApiError } from '../../utils/errors';
import { mockResponse } from '../../utils/test-utils';

describe(errorSerializer, () => {
  test('should deserialize original error and axios response', () => {
    const error = new UnknownApiError('The server is on fire');
    const data = {
      code: '20000',
      data: ['Oh noes!'],
      msg: 'The server is on fire',
    };
    const config: AxiosRequestConfig = {
      data: '{"hello": "world"}',
      method: 'post',
      url: 'https://example.com/api/test',
    };

    error.requestConfig = config;
    error.response = mockResponse(data, {
      config,
    });

    expect(errorSerializer(error)).toEqual({
      message: 'The server is on fire',
      name: 'UnknownApiError',
      request: {
        data: '{"hello": "world"}',
        url: 'https://example.com/api/test',
      },
      response: {
        data,
        status: 200,
      },
      stack: expect.any(String),
    });
  });
});
