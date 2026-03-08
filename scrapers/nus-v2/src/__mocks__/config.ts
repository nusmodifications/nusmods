import { Config } from '../config';

const config: Config = {
  // From env
  acadApiKey: '',
  acadAppKey: '',
  appKey: '',
  baseUrl: 'https://example.com/api',
  courseApiKey: '',
  studentKey: '',
  ttApiKey: '',

  // Other config
  academicYear: '2018/2019',
  apiConcurrency: 1,
  dataPath: '',
  elasticConfig: {
    node: 'http://localhost:9200',
  },
};

export default config;
