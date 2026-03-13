export default {
  academicYear: process.env.ACADEMIC_YEAR,

  // Width of the page in pixels
  pageWidth: Number(process.env.PAGE_WIDTH) || 1024,

  // If set to a local path, the page will be loaded using setContent - use this
  // for production
  // If set to a URL, the page will be loaded instead - use localhost:8081 in
  // development with Webpack hot reload server
  page: process.env.PAGE!,

  // Path to a folder containing module data. If null, during development the
  // NUSMods API will be used instead. In production leaving this as null will
  // throw an error.
  moduleData: process.env.MODULE_DATA || null,

  // Sentry DSN string used for the error reporting and feedback form
  sentryDsn: process.env.SENTRY_DSN,
};
