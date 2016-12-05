export default function sortByKey(object) {
  var sortedObject = {};
  Object.keys(object).sort().forEach(function (key) {
    sortedObject[key] = object[key];
  });
  return sortedObject;
};
