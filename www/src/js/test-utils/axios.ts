import { AxiosRequestConfig, AxiosResponse } from 'axios';
import httpStatus from 'http-status';

/**
 * Mock an Axios response object
 */
export function mockResponse<T>(
  data: T,
  additionalFields: {
    headers?: { [name: string]: string };
    config?: Partial<AxiosRequestConfig>;
    request?: any;
    status?: number;
    statusText?: string;
  } = {},
): AxiosResponse<T> {
  const { headers, config, request, status, statusText } = additionalFields;

  return {
    data,
    status: status || 200,
    // @ts-ignore TS won't recognize this as valid because httpStatus is defined as a dictionary of static values
    statusText: statusText || httpStatus[status] || 'OK',
    headers: headers || {},
    config: config || {},
    request: request || {},
  };
}
