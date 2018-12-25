import bunyan from 'bunyan';
import { omit, isObjectLike } from 'lodash';

function apolloDataSerializer(data) {
  if (!isObjectLike(data)) return data;
  /* eslint-disable no-underscore-dangle */
  const newData = omit(data, '__schema');
  const newSchema = omit(data.__schema, 'types', 'directives');
  newData.__schema = newSchema;
  return newData;
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
