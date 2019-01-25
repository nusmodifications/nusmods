// @flow

import env from '../env.json';

export type Config = {|
  +appKey: string,
  +studentKey: string,
  +baseUrl: string,

  // The number of concurrent requests allowed by the API
  // Any additional requests will be queued
  +apiConcurrency: number,
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

  apiConcurrency: 5,
};

export default config;
