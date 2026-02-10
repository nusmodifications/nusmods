import path from 'path';
import * as fs from 'fs-extra';
import { ClientOptions } from '@elastic/elasticsearch';

export type Config = Readonly<{
  appKey: string;
  studentKey: string;
  ttApiKey: string;
  courseApiKey: string;
  acadApiKey: string;
  acadAppKey: string;

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

if (!env.baseUrl || !env.ttApiKey || !env.courseApiKey || !env.acadApiKey || !env.acadAppKey) {
  throw new Error(
    'env.json is not configured correctly. Please check that baseUrl, ttApiKey, courseApiKey, acadApiKey and acadAppKey are provided',
  );
}

// Add a trailing slash behind the base URL because otherwise the URL class will
// replace the last segment of the URL with the relative part
const addTrailingSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`);

const config: Config = {
  // From env
  appKey: env.appKey,
  studentKey: env.studentKey,
  ttApiKey: env.ttApiKey,
  courseApiKey: env.courseApiKey,
  acadApiKey: env.acadApiKey,
  acadAppKey: env.acadAppKey,
  elasticConfig: env.elasticConfig,
  baseUrl: addTrailingSlash(env.baseUrl),
  apiConcurrency: env.apiConcurrency || 5,

  // Other config
  academicYear: '2025/2026',
  dataPath: path.resolve(__dirname, '../data'),
};

export default config;
