const ivleApi = {
  baseUrl: 'https://ivle.nus.edu.sg/api/Lapi.svc/',
  key: process.env.IVLE_API_KEY,
  token: process.env.IVLE_API_TOKEN,
};

const venuesApi = {
  baseUrl: 'http://nuslivinglab.nus.edu.sg/api_dev/api/',
};

const defaults = {
  // Set which year of school data to scrape. `null` value will scrape
  // a month ahead of the most current school year's data.
  year: null,
  cachePath: 'cache',
  // Maximum cache age in seconds. Can be set to 0 to force refresh every
  // time. If set to -1, cached files never expire and are always used.
  // By default, force refresh for dist build, cache for one day otherwise.
  maxCacheAge: process.env.NODE_ENV === 'production' ? 0 : 86400,
  destFolder: 'app/api',
  // Pretty-print JSON with '\t', uglify JSON with ''.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#space_argument
  jsonSpace: process.env.NODE_ENV === 'production' ? '' : '\t',
  headers: {},
  concurrency: 128,
};

export default {
  defaults,
  bulletinModules: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    destFileName: 'bulletinModulesRaw.json',
    destFacultyDepartments: 'facultyDepartments.json',
    ivleApi,
    venuesApi,
  },
  cors: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    concurrency: defaults.concurrency,
    destFileName: 'corsRaw.json',
    destLessonTypes: 'lessonTypes.json',
  },
  corsBiddingStats: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    destFileName: 'corsBiddingStatsRaw.json',
  },
  examTimetable: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    destFileName: 'examTimetableRaw.json',
  },
  ivle: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    srcFolder: defaults.destFolder,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    concurrency: defaults.concurrency,
    destFileName: 'ivleRaw.json',
    ivleApi,
  },
  moduleTimetableDelta: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    destFileName: 'moduleTimetableDeltaRaw.json',
    ivleApi,
  },
  venues: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    destFileName: 'venuesRaw.json',
  },
  consolidate: {
    cachePath: defaults.cachePath,
    maxCacheAge: defaults.maxCacheAge,
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    destFileName: 'modules.json',
    destVenues: 'venues.json',
  },
  split: {
    destFolder: defaults.destFolder,
    jsonSpace: defaults.jsonSpace,
    destSubfolder: 'modules',
    destModuleCodes: 'moduleCodes.json',
    destModuleList: 'moduleList.json',
    destModuleInformation: 'moduleInformation.json',
    destTimetableInformation: 'timetable.json',
    destVenueInformation: 'venueInformation.json',
  },
};
