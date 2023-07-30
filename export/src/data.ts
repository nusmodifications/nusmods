import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import _ from 'lodash';
import type { Middleware } from 'koa';

import config from './config';
import type { PageData, State } from './types';

async function fetchModule(moduleCode: string) {
  const fileName = `${moduleCode}.json`;

  let mod;

  if (config.moduleData) {
    try {
      mod = await fs.readJSON(path.join(config.moduleData, fileName));
    } catch (error) {
      // Continue if file is not found
      if (error.code !== 'ENOENT') throw error;
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

export async function getModules(moduleCodes: string[]) {
  const modules = await Promise.all(
    moduleCodes.map((moduleCode) => fetchModule(moduleCode).catch(() => null)),
  );

  return modules.filter(Boolean);
}

export const parseExportData: Middleware<State> = (ctx, next) => {
  if (ctx.query.data) {
    try {
      // @ts-expect-error: type string[] is not assignable to type string
      const data = JSON.parse(ctx.query.data);
      validateExportData(data);
      ctx.state.data = data;
    } catch (e) {
      ctx.throw(422, 'Invalid timetable data', { original: e });
    }
  }

  return next();
};

export function validateExportData(data: PageData) {
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
