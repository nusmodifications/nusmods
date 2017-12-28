/**
 * Reorders the object by the sorting order of the keys.
 */
export default function sortByKey(object) {
  const sortedObject = {};
  Object.keys(object).sort().forEach((key) => {
    sortedObject[key] = object[key];
  });
  return sortedObject;
}
