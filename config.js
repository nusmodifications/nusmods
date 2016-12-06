const ivleApi = {
  baseUrl: 'https://ivle.nus.edu.sg/api/Lapi.svc/',
  key: process.env.IVLE_API_KEY || '8QeGOieWvKXLZBV894S7I',
  token: process.env.IVLE_API_TOKEN || '6D1B29A5EB2447FB117B385174715C2DE067691CDACC61939FBA1BD7A8467F6D5ECD530224823ABD962B6FAF25103596B96220FEA8FB49BAA1C840707E81FB6408BFB538DFA601447DA5E85E3B30A8CB7FC9CA52165CDC5529CE00DF604E31C27C005370F26F0E20C9A38013A75C39E0417D89554B8F6967F501F1860FBD5CA4E9D5D16B91F65A860AC0815764F43BD48AEA5B7A17218354F665DF2A04714F3494E386EE4CBE173984372B6E6A096EF707E216FCAAF0614AF5899F3727B5B95A7D3483E9ED72B9AC051D175E5FD392C0',
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
  concurrency: 256,
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
