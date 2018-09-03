// @flow
import Knex from 'knex';
import convertCase from './convertCase';
import knexConfigs from '../../knexfile';

// Patch config to convert between snake_case <=> camelCase
const config = {
  ...knexConfigs[process.env.NODE_ENV],
  wrapIdentifier(value, origImpl) {
    return origImpl(convertCase.snakeCase(value));
  },
  postProcessResponse(result) {
    return convertCase.camelCase(result);
  },
};
// Create an appropriate knex instance
const knex = Knex(config);

export default knex;
