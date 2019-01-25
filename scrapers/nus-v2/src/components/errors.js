// @flow

/**
 * Defines custom error classes
 */

import type { $AxiosXHR } from 'axios';

/**
 * Base API error class representing all errors thrown from
 * API methods.
 */
export class ApiError extends Error {
  // The original response
  response: ?$AxiosXHR<any>;

  // The original data object from the response
  // (not the inner data object in the response)
  data: ?any;

  originalError: ?Error;
}

export class UnknownApiError extends ApiError {}

export class NotFoundError extends ApiError {}

export class AuthError extends ApiError {}
