import type { AxiosRequestConfig } from 'axios';
import { errorSerializer } from './serializer';
import { UnknownApiError } from '../../utils/errors';
import { mockResponse } from '../../utils/test-utils';

jest.unmock('bunyan');

describe(errorSerializer, () => {
  test('should deserialize original error and axios response', () => {
    const error = new UnknownApiError('The server is on fire');
    const data = {
      code: '20000',
      msg: 'The server is on fire',
      data: ['Oh noes!'],
    };
    const config: AxiosRequestConfig = {
      url: 'https://example.com/api/test',
      method: 'post',
      data: '{"hello": "world"}',
    };

    error.requestConfig = config;
    error.response = mockResponse(data, {
      config,
    });

    expect(errorSerializer(error)).toEqual({
      name: 'UnknownApiError',
      message: 'The server is on fire',
      stack: expect.any(String),
      request: {
        url: 'https://example.com/api/test',
        data: '{"hello": "world"}',
      },
      response: {
        data,
        status: 200,
      },
    });
  });
});
