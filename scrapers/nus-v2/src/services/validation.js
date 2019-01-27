// @flow

/**
 * Simple validation function to ensure the API is not sending us garbage
 */

import Joi from 'joi';
import type { ModuleExam, TimetableLesson } from '../types/api';
import { activityLessonTypeMap, dayTextMap } from './mapper';

const lessonSchema = Joi.object({
  room: Joi.string(),
  start_time: Joi.string(),
  eventdate: Joi.string().isoDate(),
  activity: Joi.string().only(Object.keys(activityLessonTypeMap)),
  modgrp: Joi.string(),
  day: Joi.string().only(Object.keys(dayTextMap)),
  numweeks: Joi.number()
    .integer()
    .greater(0),
});

export function validateLesson(lesson: TimetableLesson) {
  const result = Joi.validate(lesson, lessonSchema, { presence: 'required', allowUnknown: true });
  return !result.error;
}

const examSchema = Joi.object({
  start_time: Joi.string(),
  module: Joi.string(),
  duration: Joi.number()
    .integer()
    .greater(0),
  exam_date: Joi.string().isoDate(),
});

export function validateExam(exam: ModuleExam) {
  const result = Joi.validate(exam, examSchema, { presence: 'required', allowUnknown: true });
  return !result.error;
}
