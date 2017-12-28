import _ from 'lodash';

/**
 * Recursively traverses the object and applies a function to all the keys.
 * Does not handle cyclic references.
 * This function is curried.
 * @param {* Function} func
 * @param {* Object} value
 */
function mapKeysDeep(func, value) {
  if (Array.isArray(value)) {
    return value.map(innerContent => mapKeysDeep(func, innerContent));
  }
  if (_.isObjectLike(value)) {
    const obj = {};
    Object.entries(value).forEach(([key, objValue]) => {
      obj[func(key)] = mapKeysDeep(func, objValue);
    });
    return obj;
  }
  return value; // all other cases
}

export default _.curry(mapKeysDeep);
