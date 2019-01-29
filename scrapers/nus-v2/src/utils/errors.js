// @flow

/**
 * Defines custom error classes
 */

import type { $AxiosXHR, AxiosXHRConfig } from 'axios';
import type { Task } from '../types/tasks';

/**
 * Base API error class representing all errors thrown from
 * API methods.
 */
export class ApiError extends Error {
  // The original response
  response: ?$AxiosXHR<any>;

  requestConfig: ?AxiosXHRConfig<any>;

  originalError: ?Error;

  constructor(message?: string) {
    super(message);
    Error.captureStackTrace(this, ApiError);
    this.name = this.constructor.name;
  }
}

export class UnknownApiError extends ApiError {
  constructor(message?: string) {
    super(message);
    Error.captureStackTrace(this, UnknownApiError);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApiError {
  constructor(message?: string) {
    super(message);
    Error.captureStackTrace(this, NotFoundError);
    this.name = this.constructor.name;
  }
}

export class AuthError extends ApiError {
  constructor(message?: string) {
    super(message);
    Error.captureStackTrace(this, AuthError);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when the cache has expired
 */
export class CacheExpiredError extends Error {
  path: string;
  fileModifiedTime: number;

  constructor(message?: string, path: string, fileModifiedTime: number) {
    super(message);
    Error.captureStackTrace(this, CacheExpiredError);
    this.name = this.constructor.name;

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

  constructor(message?: string, task: Task<any, any>, originalError: ?Error = null) {
    super(message);
    Error.captureStackTrace(this, TaskError);
    this.name = this.constructor.name;

    this.task = task;
    this.originalError = originalError;
  }
}
