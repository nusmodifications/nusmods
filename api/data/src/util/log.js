import bunyan from 'bunyan';
import omit from 'lodash/omit';

function apolloDataSerializer(data) {
  const { __schema, ...responseData } = data;
  const newSchema = omit(__schema, 'types', 'directives');
  return {
    ...responseData,
    __schema: newSchema,
  };
}

/**
 * Provides the default logger for the server,
 * processes and serializes graphql calls
 */
export default bunyan.createLogger({
  name: 'nusmods-api',
  level: process.env.LOG_LEVEL || 'info',
  stream: process.stdout,
  serializers: { err: bunyan.stdSerializers.err, data: apolloDataSerializer },
});
