/**
 * Defines custom error classes
 */

/* eslint-disable @typescript-eslint/no-explicit-any, max-classes-per-file */

import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Task } from '../types/tasks';

/**
 * Base API error class representing all errors thrown from
 * API methods.
 */
export class ApiError extends Error {
  // The original response
  public response?: AxiosResponse;

  public requestConfig?: AxiosRequestConfig;

  public originalError?: Error;

  public constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, ApiError);
    this.name = this.constructor.name;
  }
}

export class UnknownApiError extends ApiError {
  public constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, UnknownApiError);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApiError {
  public constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, NotFoundError);
    this.name = this.constructor.name;
  }
}

export class AuthError extends ApiError {
  public constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, AuthError);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when the cache has expired
 */
export class CacheExpiredError extends Error {
  public path: string;
  public fileModifiedTime: number;

  public constructor(message: string, path: string, fileModifiedTime: number) {
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
  public task: Task<any, any>;
  public originalError?: Error;

  public constructor(message: string, task: Task<any, any>, originalError?: Error) {
    super(message);
    Error.captureStackTrace(this, TaskError);
    this.name = this.constructor.name;

    this.task = task;
    this.originalError = originalError;
  }
}
