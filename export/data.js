const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const config = require('./config');

async function fetchModule(moduleCode) {
  let fileName = `${moduleCode}.json`;

  if (config.moduleData) {
    return fs.readJSON(path.join(config.moduleData, fileName));
  }

  // For development only
  const req = await axios.get(`http://api.nusmods.com/${config.academicYear}/modules/${fileName}`);
  return req.data;
}

async function getModules(moduleCodes) {
  const modules = await Promise.all(
    moduleCodes.map(fetchModule).catch(() => null)
  );

  return modules.filter(Boolean);
}

module.exports = {
  getModules,
};
