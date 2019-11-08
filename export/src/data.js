const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const _ = require('lodash');
const config = require('./config');

async function fetchModule(moduleCode) {
  const fileName = `${moduleCode}.json`;

  let mod;

  if (config.moduleData) {
    try {
      mod = await fs.readJSON(path.join(config.moduleData, fileName));
    } catch (error) {
      // Continue if file is not found
      if (err.code !== 'ENOENT') throw error;
    }
  }

  // Use fallback if no mod is found
  if (!mod) {
    const req = await axios.get(
      `https://api.nusmods.com/v2/${config.academicYear}/modules/${fileName}`,
    );
    mod = req.data;
  }

  return mod;
}

async function getModules(moduleCodes) {
  const modules = await Promise.all(
    moduleCodes.map((moduleCode) => fetchModule(moduleCode).catch(() => null)),
  );

  return modules.filter(Boolean);
}

function parseExportData(ctx, next) {
  if (ctx.query.data) {
    try {
      const data = JSON.parse(ctx.query.data);
      validateExportData(data);
      ctx.state.data = data;
    } catch (e) {
      ctx.throw(422, null, { original: e });
    }
  }

  return next();
}

function validateExportData(data) {
  if (!_.isObject(data)) throw new Error('data should be an object');

  if (!_.isInteger(data.semester) || data.semester < 1 || data.semester > 4) {
    throw new Error('Invalid semester');
  }

  // Handles pre-persist-migration data format
  // TODO: Remove after AY2017/18 Sem 2 when the Redux Persist migration is also removed
  if (!_.isObject(data.hidden)) {
    data.hidden = _.get(data, 'settings.hiddenInTimetable', []);
  }

  if (!_.isObject(data.colors)) {
    data.colors = _.get(data, 'theme.colors', {});
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
