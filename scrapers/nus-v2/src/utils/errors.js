// @flow

import type { $AxiosXHR } from 'axios';

export class ApiError extends Error {
  response: ?$AxiosXHR<any>;
}

export class UnknownApiError extends ApiError {}

export class NotFoundError extends ApiError {}

export class AuthError extends ApiError {}
