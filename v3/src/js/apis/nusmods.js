import config from 'config';

const ayBaseUrl = `${config.apiBaseUrl}/${config.academicYear.replace('/', '-')}`;

const NUSModsApi = {
  ayBaseUrl: () => ayBaseUrl,
  // List of modules for the entire acad year.
  moduleListUrl: () => {
    return `${ayBaseUrl}/moduleList.json`;
  },
  // Module for that acad year. Not tied to any semester.
  moduleDetailsUrl: (moduleCode) => {
    return `${ayBaseUrl}/modules/${moduleCode}.json`;
  },
};

export default NUSModsApi;
