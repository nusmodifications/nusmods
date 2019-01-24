// @flow

import env from '../env.json';

export type Config = {|
  +appKey: string,
  +studentKey: string,
  +baseUrl: string,
|};

if (!env.appKey || !env.studentKey || !env.baseUrl) {
  throw new Error(
    'env.json is not configured correctly. Please check that appKey, studentKey and baseUrl are provided',
  );
}

const config: Config = {
  // From env
  appKey: env.appKey,
  studentKey: env.studentKey,
  baseUrl: env.baseUrl,
};

export default config;
