// @flow

// eslint-disable-next-line import/prefer-default-export
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
