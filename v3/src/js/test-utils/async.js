// @flow

import util from 'util';

// eslint-disable-next-line import/prefer-default-export
export const nextTick = util.promisify(process.nextTick);
