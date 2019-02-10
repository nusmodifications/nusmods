import path from 'path';
import * as fs from 'fs-extra';

export type Config = Readonly<{
  appKey: string;
  studentKey: string;

  // Base URL for all API requests
  baseUrl: string;

  // Current academic year in the format YYYY/YYYY
  academicYear: string;

  // The number of concurrent requests allowed by the API
  // Any additional requests will be queued
  apiConcurrency: number;

  // Root folder for data
  dataPath: string;
}>;

const env = fs.readJSONSync(path.join(__dirname, '../env.json'));

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
  apiConcurrency: env.apiConcurrency || 5,

  // Other config
  academicYear: '2018/2019',
  dataPath: path.resolve(__dirname, '../data'),
};

export default config;
