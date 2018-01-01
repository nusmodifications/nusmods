const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const _ = require('lodash');
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
      validateExportData(data);
      ctx.state.data = data;
      return next();
    } catch (e) {
      ctx.status = 422;
    }
  }

  return next();
}

function validateExportData(data) {
  if (!_.isObject(data)) throw new Error('data should be an object');

  if (
    !_.isInteger(data.semester) ||
    data.semester < 1 ||
    data.semester > 4
  ) {
    throw new Error('Invalid semester');
  }

  // TODO: Improve these validation
  if (!_.isObject(data.timetable)) {
    throw new Error('Invalid timetable');
  }

  if (!_.isObject(data.settings)) {
    throw new Error('Invalid settings');
  }

  if (!_.isObject(data.theme)) {
    throw new Error('Invalid theme');
  }
}

module.exports = {
  parseExportData,
  getModules,
};
