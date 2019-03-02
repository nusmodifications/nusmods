import bunyan from 'bunyan';
import { ApiError } from '../../utils/errors';

/* eslint-disable import/prefer-default-export, @typescript-eslint/no-explicit-any */

const defaultErrorSerializer = bunyan.stdSerializers.err;

function serializeApiError(error: ApiError) {
  const { originalError, response, requestConfig } = error;

  const data: Record<string, any> = defaultErrorSerializer(error);

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
