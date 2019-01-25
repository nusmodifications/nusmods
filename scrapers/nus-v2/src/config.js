// @flow

import path from 'path'
import env from '../env.json';

export type Config = {|
  +appKey: string,
  +studentKey: string,
  +baseUrl: string,

  // Current academic year in the format YYYY-YYYY
  +academicYear: string,

  // The number of concurrent requests allowed by the API
  // Any additional requests will be queued
  +apiConcurrency: number,

  // Root folder for data
  +dataPath: string,
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

  // Other config
  academicYear: '2018-2019',
  apiConcurrency: 5,
  dataPath: path.resolve(__dirname, '../data'),
};

export default config;
