// @flow
import bunyan from 'bunyan';
import { ApiError } from '../errors';

/* eslint-disable import/prefer-default-export */

const defaultErrorSerializer = bunyan.stdSerializers.err;

function serializeApiError(error: ApiError) {
  const { originalError, response, requestConfig } = error;

  const data: Object = defaultErrorSerializer(error);

  if (originalError && originalError instanceof Error) {
    data.originalError = defaultErrorSerializer(originalError);
  }

  if (requestConfig) {
    data.request = {
      data: requestConfig.data,
      url: requestConfig.url,
    };
  }

  if (response) {
    data.response = {
      status: response.status,
      data: response.data,
    };
  }

  return data;
}

export function errorSerializer(error: Error) {
  if (!error) return error;

  if (error instanceof ApiError) {
    return serializeApiError(error);
  }

  return defaultErrorSerializer(error);
}
