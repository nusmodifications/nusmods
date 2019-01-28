// @flow

/**
 * Defines custom error classes
 */

import type { $AxiosXHR } from 'axios';
import type { Task } from '../types/tasks';

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

export class CacheExpiredError extends Error {
  path: string;
  fileModifiedTime: number;

  constructor(message: string, path: string, fileModifiedTime: number) {
    super(message);

    this.path = path;
    this.fileModifiedTime = fileModifiedTime;
  }
}

/**
 * Generic error for tasks
 */
export class TaskError extends Error {
  task: Task<any, any>;
  originalError: ?Error;

  constructor(message: string, task: Task<any, any>, originalError: ?Error = null) {
    super(message);
    this.task = task;
    this.originalError = originalError;
  }
}
