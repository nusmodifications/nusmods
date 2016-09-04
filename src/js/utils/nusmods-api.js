import config from 'config';

const ayBaseUrl = `${config.apiBaseUrl}/${config.academicYear.replace('/', '-')}`;

const NUSModsApi = {
  ayBaseUrl: () => ayBaseUrl,
  // List of modules for the entire acad year
  moduleListUrl: () => {
    return `${ayBaseUrl}/moduleList.json`;
  },
};

export default NUSModsApi;
