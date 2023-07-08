import { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import httpStatus from 'http-status';

/**
 * Mock an Axios response object
 */
export function mockResponse<T>(
  data: T,
  additionalFields: {
    headers?: { [name: string]: string };
    config?: InternalAxiosRequestConfig<T>;
    request?: any;
    status?: number;
    statusText?: string;
  } = {},
): AxiosResponse<T> {
  const { headers, config, request, status, statusText } = additionalFields;

  return {
    data,
    status: status || 200,
    // TS won't recognize this as valid because httpStatus is defined as a dictionary of static values
    statusText:
      statusText ||
      (status != null ? (httpStatus[String(status) as keyof typeof httpStatus] as string) : 'OK'),
    headers: headers || {},
    config: config || {
      headers: new AxiosHeaders(),
    },
    request: request || {},
  };
}
