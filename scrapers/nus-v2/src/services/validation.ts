/**
 * Simple validation function to ensure the API is not sending us garbage
 */

import Joi from 'joi';

import { ModuleExam, TimetableLesson } from '../types/api';
import { Semester, Semesters } from '../types/modules';

import { activityLessonType, dayTextMap } from '../utils/data';
import rootLogger, { Logger } from './logger';

/* eslint-disable camelcase */

const lessonSchema = Joi.object({
  // Allow null because we can still use the rest of the information
  room: Joi.string().allow(null),
  start_time: Joi.string(),
  end_time: Joi.string().not(Joi.ref('start_time')),
  eventdate: Joi.string().isoDate(),

  activity: Joi.string()
    .allow(...Object.keys(activityLessonType))
    .only(),

  modgrp: Joi.string(),

  // Assume lessons on Sunday are invalid
  day: Joi.string()
    .allow(...Object.keys(dayTextMap))
    .only(),

  numweeks: Joi.number().integer().greater(0),

  // csize of 0 occur on valid lessons for some reason
  csize: Joi.number().integer().greater(-1),
});

export function validateLesson(lesson: TimetableLesson, logger: Logger = rootLogger) {
  const result = lessonSchema.validate(lesson, {
    presence: 'required',
    allowUnknown: true,
    // Don't abort early so we can log all errors
    abortEarly: process.env.NODE_ENV === 'production',
  });

  if (result.error) logger.debug({ service: 'validation', error: result.error }, 'Invalid lesson');
  return !result.error;
}

const examSchema = Joi.object({
  start_time: Joi.string(),
  module: Joi.string(),
  duration: Joi.number().integer().greater(0),
  exam_date: Joi.string().isoDate(),
});

export function validateExam(exam: ModuleExam, logger: Logger = rootLogger) {
  const result = examSchema.validate(exam, {
    presence: 'required',
    allowUnknown: true,
    // Don't abort early so we can log all errors
    abortEarly: process.env.NODE_ENV === 'production',
  });

  if (result.error) logger.debug({ service: 'validation', error: result.error }, 'Invalid exam');
  return !result.error;
}

const semesterSchema = Joi.number()
  .allow(...Semesters)
  .only();

export function validateSemester(semester: string | Semester) {
  const result = semesterSchema.validate(+semester, { presence: 'required' });
  return !result.error;
}
