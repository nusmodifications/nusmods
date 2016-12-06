import bunyan from 'bunyan';

export default bunyan.createLogger({
  name: 'nusmods-api',
  level: process.env.LOG_LEVEL || 'info',
  stream: process.stdout,
  serializers: bunyan.stdSerializers,
});
