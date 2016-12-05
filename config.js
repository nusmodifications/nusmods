const ivleApi = {
  'baseUrl': 'https://ivle.nus.edu.sg/api/Lapi.svc/',
  'key': 'APILoadTest',
  'token': process.env.IVLE_API_TOKEN,
};

const venuesApi = {
  'baseUrl': 'http://nuslivinglab.nus.edu.sg/api_dev/api/',
};

const defaults = {
  // Set which year of school data to scrape. `null` value will scrape
  // a month ahead of the most current school year's data.
  year: null,
  cachePath: 'cache',
  concurrencyLimit: 128,
  // Maximum cache age in seconds. Can be set to 0 to force refresh every
  // time. If set to -1, cached files never expire and are always used.
  // By default, force refresh for dist build, cache for one day otherwise.
  maxCacheAge: process.env.NODE_ENV === 'production' ? 0 : 86400,
  destFolder: 'app/api',
  // Pretty-print JSON with '\t', uglify JSON with ''.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#space_argument
  jsonSpace: process.env.NODE_ENV === 'production' ? '' : '\t',
  headers: {},
};

export default {
  defaults,
  bulletinModules: {
    options: {
      cachePath: defaults.cachePath,
      maxCacheAge: defaults.maxCacheAge,
      destFolder: defaults.destFolder,
      jsonSpace: defaults.jsonSpace,
      destFileName: 'bulletinModulesRaw.json',
      ivleApi,
      venuesApi,
    },
    semester0: {
      options: {
        semester: '0'
      }
    },
    semester1: {
      options: {
        semester: '1'
      }
    },
    semester2: {
      options: {
        semester: '2'
      }
    },
    semester3: {
      options: {
        semester: '3'
      }
    },
    semester4: {
      options: {
        semester: '4'
      }
    }
  },
  examTimetable: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    destFileName: 'examTimetableRaw.json',
  },
};
