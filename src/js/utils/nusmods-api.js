import config from 'config';

const ayBaseUrl = `${config.apiBaseUrl}/${config.academicYear.replace('/', '-')}`;

const NUSModsApi = {
  ayBaseUrl: () => ayBaseUrl,
  // List of modules for the entire acad year
  moduleListUrl: () => {
    return `${ayBaseUrl}/moduleList.json`;
  },
  moduleDetailsUrl: (moduleCode, semester = config.semester) => {
    return `${ayBaseUrl}/${semester}/modules/${moduleCode}.json`;
  },
};

export default NUSModsApi;
