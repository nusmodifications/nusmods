import bunyan from 'bunyan';

/**
 * Provides the default logger for the server,
 * processes and serializes http calls
 */
export default bunyan.createLogger({
  name: 'nusmods-api',
  level: process.env.LOG_LEVEL || 'info',
  stream: process.stdout,
  serializers: bunyan.stdSerializers,
});
