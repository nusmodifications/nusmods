const _ = require('lodash');
const browserslist = require('browserslist');

function getTemplate() {
  return _.mapValues(browserslist.data, (info) => {
    const versionMap = {};
    info.versions.forEach((version) => {
      versionMap[version] = 0;
    });
    return versionMap;
  });
}

function getVersionMapping(browserCode, versionString) {
  const versions = _.get(browserslist, ['data', browserCode, 'versions']);
  if (!versions) {
    return undefined;
  }

  let version;
  if (browserCode === 'edge') {
    version = versionString.split('.')[0];
  } else if (browserCode === 'ios_saf') {
    // Handle special case where ios_saf has no version
    version = versionString ? versionString : _.last(versions);
  } else if (versionString) {
    version = versionString
      .split('.')
      .filter((str) => parseInt(str, 10))
      .join('.');
  } else {
    return undefined;
  }

  if (versions.includes(version)) {
    // Return if exact match exists
    return version;
  }
  // Return alias if it exists
  const alias = _.get(browserslist, ['versionAliases', browserCode, version]);
  if (alias) {
    return alias;
  }

  // If it is a newer version, return one that exists in browserslist instead
  const latestVersion = _.last(versions);
  if (version > latestVersion) {
    return latestVersion;
  }

  return undefined;
}

module.exports = {
  getTemplate,
  getVersionMapping,
};
