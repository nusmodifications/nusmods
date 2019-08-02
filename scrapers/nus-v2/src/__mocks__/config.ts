import { Config } from '../config';

const config: Config = {
  // From env
  appKey: '',
  studentKey: '',
  baseUrl: 'https://example.com/api',

  // Other config
  academicYear: '2018/2019',
  apiConcurrency: 1,
  dataPath: '',
  elasticConfig: {
    node: 'http://localhost:9200',
  },
};

export default config;
