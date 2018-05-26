// @flow
import type { Readable } from 'stream';

export function mockResponse<Data>(data: Data) {
  return {
    data,

    headers: {
      lastModified: 'Wed, 21 Oct 2015 07:28:00 GMT',
    },

    status: 200,

    statusText: 'OK',

    config: {},

    request: {},
  };
}

export async function streamToString(stream: Readable) {
  return new Promise((resolve) => {
    let output = '';

    stream.on('data', (chunk) => {
      output += chunk.toString();
    });

    stream.on('end', () => {
      resolve(output);
    });
  });
}
