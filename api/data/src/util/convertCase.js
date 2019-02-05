import { isObjectLike, memoize, camelCase, snakeCase } from 'lodash';

const memoizeSnakeCase = memoize(snakeCase);
const memoizeCamelCase = memoize(camelCase);

function camelCaseResult(x) {
  if (Array.isArray(x)) {
    return x.map(camelCaseResult);
  }
  if (isObjectLike(x)) {
    const obj = {};
    Object.entries(x).forEach(([key, value]) => {
      obj[memoizeCamelCase(key)] = value;
    });
    return obj;
  }
  return memoizeCamelCase(x);
}

export default {
  snakeCase: memoizeSnakeCase,
  camelCase: camelCaseResult,
};
