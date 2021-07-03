// Intermediate types used to contain timetable information relevant to the optimizer
import { mapValues, groupBy } from 'lodash';
import { Module, RawLesson, StartTime, EndTime } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';

// {module id}__{lesson type}__{lesson id} e.g., CS3203__Lecture__1
export type UniqueLessonString = string;
export type Z3LessonID = number;

/**
 * Main input format into the optimizer layers
 * */
export type OptimizerInput = {
  moduleInfo: ModuleInfoWithConstraints[];
  constraints: GlobalConstraints;
};

/**
 * Callbacks to communicate with the caller of TimetableOptimizer
 * */
export interface OptimizerCallbacks {
  onOptimizerInitialized(): void;
  onSmtlib2InputCreated(s: string): void;
  onOutput(s: string): void;
  onTimetableOutput(timetable: OptimizerOutput): void;
}

/**
 * Final timetable output to the optimizer caller
 * */
export type OptimizerOutput = {
  isSat: boolean;
  timetable: SemTimetableConfig;
};

/**
 * Modules for optimizer to consider.
 *  required is a constraint indicating if the module can be dropped to fulfil other constraints
 * */
export type ModuleInfoWithConstraints = {
  mod: Module;
  required: boolean;
  lessonsGrouped: LessonsByGroupsByClassNo;
};

// Mapping between lesson types -> classNo -> lessons.
//  We have to take one classNo of each lessonType, so this indicates all the slots to be filled
//    per classNo per lessonType
export type LessonsByGroupsByClassNo = {
  [lessonType: string]: LessonsForLessonType;
};

export type LessonsForLessonType = { [classNo: string]: readonly RawLesson[] };

/*
 * A list of times that are assigned to a particular owner (e.g., a lesson)
 * Used throughout optimizer to indicate that a particular block of time should be reserved if a owner id is chosen
 */
export interface SlotConstraint {
  startEndTimes: Array<[number, number]>; // Array of start and end times as integers
  ownerId: number; // Numeric ID of owner, since we will encode this as an integer constraint
  ownerString: string; // string representing the owner: user-interpretable, used for varnames
}

/*
 * Indicating that a varname (boolean selector) has a cost attached to it if it is chosen.
 */
export interface WorkloadCost {
  varname: string;
  cost: number;
}

// User-selected constraints to pass to optimizer
export interface GlobalConstraints {
  // Min/max number of MCs + whether the constraint is active
  isWorkloadActive: boolean;
  minWorkload: number;
  maxWorkload: number;
  // Find exactly N free days + whether the constraint is active
  isFreeDayActive: boolean;
  numRequiredFreeDays: number;
  // Force these exact free days + whether the constraint is active
  isSpecificFreeDaysActive: boolean;
  specificFreeDays: Array<string>;
  // When lessons should start and end + whether the constraint is active
  isTimeConstraintActive: boolean;
  startTime: StartTime;
  endTime: EndTime;
  // The hours where a lunch break should be allocated,
  //  how many half-hour slots to allocate, and whether the constraint is active
  isLunchBreakActive: boolean;
  lunchStart: StartTime;
  lunchEnd: EndTime;
  lunchHalfHours: number;
  // Ask optimizer to compact timetable to leave as few gaps between lessons as possible
  isPreferCompactTimetable: boolean;
}

/**
 * Defs for communicating between Optimizer <-> WebWorker <-> WASM wrapper
 * */
// Need to disable since there's an eslint bug with enums
// eslint-disable-next-line no-shadow
export enum Z3WorkerMessageKind {
  // Request to init
  INIT = 'INIT',
  // Z3 initialized
  INITIALIZED = 'INITIALIZED',
  // Run the optimizer
  OPTIMIZE = 'OPTIMIZE',
  // Print output
  PRINT = 'PRINT',
  // Error
  ERR = 'ERR',
  // Z3 finished runnung
  EXIT = 'EXIT',
  // Z3 aborted
  ABORT = 'ABORT',
}

/**
 * Message to be sent back and forth between a Z3 webworker and any callers
 * */
export interface Z3WorkerMessage {
  kind: Z3WorkerMessageKind;
  msg: string;
}

// TODO Shouldn't be here
export const defaultConstraints: GlobalConstraints = {
  isWorkloadActive: false,
  minWorkload: 0,
  maxWorkload: 30,
  isFreeDayActive: false,
  numRequiredFreeDays: 1,
  isSpecificFreeDaysActive: false,
  specificFreeDays: [],
  startTime: '0800',
  endTime: '2200',
  lunchStart: '1100',
  lunchEnd: '1500',
  lunchHalfHours: 2,
  isLunchBreakActive: false,
  isTimeConstraintActive: false,
  isPreferCompactTimetable: false,
};

/**
 * TODO move to utils
 * Transforms a module's lessons into a mapping from
 *  lessonType ==> (classNo ==> list of lessons)
 * The optimizer cares that a classNo contains all the slots that should be filled.
 * */
export function lessonByGroupsByClassNo(lessons: readonly RawLesson[]): LessonsByGroupsByClassNo {
  const lessonByGroups: { [lessonType: string]: readonly RawLesson[] } = groupBy(
    lessons,
    (lesson) => lesson.lessonType,
  );
  const lessonByGroupsByClassNumber = mapValues(
    lessonByGroups,
    (lessonsOfSamelessonType: readonly RawLesson[]) =>
      groupBy(lessonsOfSamelessonType, (lesson) => lesson.classNo),
  );
  return lessonByGroupsByClassNumber;
}
