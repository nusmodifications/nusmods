import { isObjectLike, invert } from 'lodash';
import { TABLES, COLUMNS } from './constants';

/**
 * Only do conversion according to known column and table names in
 * constants.js because knex's own migration tables and queries also
 * run though these functions.
 */

const CAMEL_CASE_TO_SNAKE_CASE = { ...TABLES, ...COLUMNS };
const SNAKE_CASE_TO_CAMEL_CASE = invert(CAMEL_CASE_TO_SNAKE_CASE);

function snakeCase(camelCaseStr) {
  return CAMEL_CASE_TO_SNAKE_CASE[camelCaseStr] || camelCaseStr;
}
function camelCase(snakeCaseStr) {
  return SNAKE_CASE_TO_CAMEL_CASE[snakeCaseStr] || snakeCaseStr;
}

function camelCaseResult(x) {
  if (Array.isArray(x)) {
    return x.map(camelCaseResult);
  } else if (isObjectLike(x)) {
    const obj = {};
    Object.entries(x).forEach(([key, value]) => {
      obj[camelCase(key)] = value;
    });
    return obj;
  }
  return camelCase(x);
}

export default {
  snakeCase,
  camelCase: camelCaseResult,
};
