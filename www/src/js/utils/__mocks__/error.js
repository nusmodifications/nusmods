// @flow

import * as error from '../error';

export const captureException: typeof error.captureException = jest.fn();
export const getScriptErrorHandler: any = jest.fn().mockReturnValue(() => jest.fn());
