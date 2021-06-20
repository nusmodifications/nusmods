import path from 'path';
import * as fs from 'fs-extra';
import { ClientOptions } from '@elastic/elasticsearch';

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

  // Config to connect to elasticsearch
  elasticConfig?: ClientOptions;
}>;

const env = fs.readJSONSync(path.join(__dirname, '../env.json'));

if (!env.appKey || !env.studentKey || !env.baseUrl) {
  throw new Error(
    'env.json is not configured correctly. Please check that appKey, studentKey and baseUrl are provided',
  );
}

// Add a trailing slash behind the base URL because otherwise the URL class will
// replace the last segment of the URL with the relative part
const addTrailingSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`);

const config: Config = {
  // From env
  appKey: env.appKey,
  studentKey: env.studentKey,
  elasticConfig: env.elasticConfig,
  baseUrl: addTrailingSlash(env.baseUrl),
  apiConcurrency: env.apiConcurrency || 5,

  // Other config
  academicYear: '2021/2022',
  dataPath: path.resolve(__dirname, '../data'),
};

export default config;
