// @flow

import type { AxiosResponse } from 'axios';

export class ApiError extends Error {
  response: ?AxiosResponse;
}

export class UnknownApiError extends ApiError {}

export class NotFoundError extends ApiError {}

export class AuthError extends ApiError {}
