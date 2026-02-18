import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import _ from 'lodash';
import Joi from 'joi';
import type { Middleware } from 'koa';

import config from './config';
import type { ExportData, State } from './types';

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
      if (typeof ctx.query.data !== 'string') {
        throw new Error(`Expected query.data to be string, got ${typeof ctx.query.data}`);
      }
      const data = JSON.parse(ctx.query.data);
      validateExportData(data);
      ctx.state.data = data;
    } catch (e) {
      ctx.throw(422, 'Invalid timetable data', { original: e });
    }
  }

  return next();
};

export function validateExportData(data: ExportData) {
  if (!_.isObject(data)) throw new Error('data should be an object');

  /**
   * type ModuleLessonConfig = {
   *   [lessonType: LessonType]: LessonIndex[];
   * };
   */
  const moduleLessonConfigSchema = Joi.object().pattern(
    Joi.string(),
    Joi.array().items(Joi.number().integer().min(0)),
  );

  /**
   * type SemTimetableConfig = {
   *   [moduleCode: ModuleCode]: ModuleLessonConfig;
   * };
   */
  const timetableSchema = Joi.object().pattern(Joi.string(), moduleLessonConfigSchema);

  const taModulesConfigSchema = Joi.array().items(Joi.string());
  const themeSchema = Joi.object({
    id: Joi.string(),
    timetableOrientation: Joi.string().valid('HORIZONTAL', 'VERTICAL'),
    showTitle: Joi.boolean(),
  });
  const pageDataSchema = Joi.object({
    semester: Joi.number().integer().greater(0).less(5),
    timetable: timetableSchema,
    colors: Joi.object().pattern(Joi.string(), Joi.number().integer().min(0)),
    hidden: Joi.array().items(Joi.string()),
    ta: taModulesConfigSchema,
    settings: Joi.object({
      colorScheme: Joi.string().valid('LIGHT_COLOR_SCHEME', 'DARK_COLOR_SCHEME'),
    }),
    theme: themeSchema,
  });

  const result = pageDataSchema.validate(data, { allowUnknown: true });
  if (result.error !== undefined) {
    throw new Error(JSON.stringify(result.error));
  }
}
