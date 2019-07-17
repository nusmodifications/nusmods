import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import _ from 'lodash';
import { Middleware } from 'koa';

import config from './config';
import { PageData, State } from './types';

async function fetchModule(moduleCode: string) {
  let fileName = `${moduleCode}.json`;

  if (config.moduleData) {
    return fs.readJSON(path.join(config.moduleData, fileName));
  }

  // For development only
  const req = await axios.get(
    `http://api.nusmods.com/v2/${config.academicYear}/modules/${fileName}`,
  );
  return req.data;
}

export async function getModules(moduleCodes: string[]) {
  const modules = await Promise.all(
    moduleCodes.map((moduleCode) => fetchModule(moduleCode).catch(() => null)),
  );

  return modules.filter(Boolean);
}

export const parseExportData: Middleware<State> = (ctx, next) => {
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
};

function validateExportData(data: PageData) {
  if (!_.isObject(data)) throw new Error('data should be an object');

  if (!_.isInteger(data.semester) || data.semester < 1 || data.semester > 4) {
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
