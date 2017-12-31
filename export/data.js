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
    moduleCodes.map(moduleCode => fetchModule(moduleCode).catch(() => null))
  );

  return modules.filter(Boolean);
}

function parseExportData(ctx, next) {
  if (ctx.query.data) {
    try {
      const data = JSON.parse(ctx.query.data);
      ctx.state.data = data;
      return next();
    } catch (e) {
      ctx.status = 422;
    }
  }
}

module.exports = {
  parseExportData,
  getModules,
};
