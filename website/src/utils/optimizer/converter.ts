import {
  OptimizerInput,
  UniqueLessonString,
  Z3LessonID,
  ModuleInfoWithConstraints,
  SlotConstraint,
  OptimizerOutput,
  LessonsForLessonType,
  WorkloadCost,
} from 'types/optimizer';
import { LessonTime, DayText, RawLesson, Weeks, NumericWeeks, isWeekRange } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';
import { Z3WeekSolver } from 'utils/optimizer/z3WeekSolver';
import { LESSON_TYPE_ABBREV, LESSON_ABBREV_TYPE } from 'utils/timetables';
import {
  Z3TimetableSolver,
  UNASSIGNED,
  FREE,
  TOOEARLY_LATE,
} from 'utils/optimizer/z3TimetableSolver';
import { invert } from 'lodash';
import {
  DAYS,
  DAY_IDXS,
  HOURS_PER_DAY,
  IDX_DAYS,
  HOURS_PER_WEEK,
  NUM_WEEKS,
} from 'utils/optimizer/constants';
import { parse, Expr, ExprNode } from 'sexpr-plus';
/**
 * Converts to and from the high-level module/lesson input data to the optimizer
 *  and SMTLIB2 code used in Z3.
 * It's a class as it has to maintain state between input and output to the optimizer.
 * */
export class OptimizerInputSmtlibConverter {
  optimizerInput: OptimizerInput;

  z3tt: Z3TimetableSolver;

  // When to consider the start and end of the timetable simulation
  startHour: number; // e.g., 8 for 8 am

  endHour: number; // e.g., 22 for 10 pm

  // These store the mapping between strings that we understand (module + lessontype + lessonid) and Z3 integers
  stringToOwnerIdTable: Record<UniqueLessonString, Z3LessonID>; // string in both cases is {module id}__{lesson type}__{lesson id}

  ownerIdToStringTable: Record<Z3LessonID, UniqueLessonString>;

  weeksToSimulate: Set<number>; // Each number in here is one week to simulate

  constructor(
    optimizerInput: OptimizerInput,
    totalHalfHourSlots: number,
    dayStartHour: number,
    dayEndHour: number,
  ) {
    if (dayStartHour >= dayEndHour)
      throw new Error(`Unexpected: start hour ${dayStartHour} >= end hour ${dayEndHour}`);
    if (totalHalfHourSlots <= 0)
      throw new Error(`Unexpected: half hour slots ${totalHalfHourSlots} <= 0`);

    this.optimizerInput = optimizerInput;
    this.startHour = dayStartHour;
    this.endHour = dayEndHour;
    this.stringToOwnerIdTable = {};
    this.ownerIdToStringTable = {};
    this.populateOwnerIdTables();

    // User-parseable names for Z3 to name each variable representing (week, day, hour, minute)
    const timeStrVals: Array<string> = Array.from(
      new Array(totalHalfHourSlots),
      (_: number, i: number) => {
        const [offset, day, week] = z3TimeToGenericTime(i);
        const dayOfWeek = idxToDayStr(day);
        const hour: number = Math.floor(offset / 2) + this.startHour;
        const hourStr: string = hour < 10 ? `0${hour.toString()}` : hour.toString();
        const minuteStr: string = offset % 2 === 0 ? '00' : '30';
        return `${dayOfWeek}_${hourStr}${minuteStr}_wk${week.toString()}`;
      },
    );

    this.z3tt = new Z3TimetableSolver(totalHalfHourSlots, timeStrVals);
    this.weeksToSimulate = new Set(); // 1-indexed weeks to simulate for the timetable
  }

  /**
   * Every lesson slot (unique combination of module - lessontype - lessonid) needs to have an integer representation to
   * let the solver use integer constraints. Create the tables to transform between string and integer representations.
   * */
  populateOwnerIdTables() {
    this.optimizerInput.moduleInfo.forEach(
      (modInfo: ModuleInfoWithConstraints, moduleidx: number) => {
        Object.keys(modInfo.lessonsGrouped).forEach((lessonType: string, lessontypeidx: number) => {
          const classNosOfLessontype: string[] = Object.keys(modInfo.lessonsGrouped[lessonType]);
          classNosOfLessontype.forEach((lessonName: string, lessonidx: number) => {
            const key = lessonInfoToZ3Varname(modInfo.mod.moduleCode, lessonType, lessonName);
            // eslint-disable-next-line no-bitwise
            this.stringToOwnerIdTable[key] = (moduleidx << 20) | (lessontypeidx << 10) | lessonidx;
          });
        });
      },
    );
    this.ownerIdToStringTable = invert(this.stringToOwnerIdTable);
  }

  /**
   * STEP 1 of solve:
   *  Generate first-stage solver string for which weeks to simulate
   * */
  generateWeekSolveSmtLib2String(): string {
    const weekSolver: Z3WeekSolver = new Z3WeekSolver(NUM_WEEKS);
    const uniqueWeeks: Set<string> = new Set();

    // Go through every lesson and generate all possible unique combinations of lesson weeks
    this.optimizerInput.moduleInfo.forEach((modInfo: ModuleInfoWithConstraints) => {
      Object.keys(modInfo.lessonsGrouped).forEach((lessonType: string) => {
        const lessonsForLessontype: LessonsForLessonType = modInfo.lessonsGrouped[lessonType];
        Object.keys(lessonsForLessontype).forEach((classNo: string) => {
          const lessons: readonly RawLesson[] = lessonsForLessontype[classNo];
          lessons
            .map((l: RawLesson) => l.weeks)
            .forEach((weeks: Weeks) => {
              // This weird stringify + parse later is to only have unique combinations of weeks
              // in the Set above. This makes solving the weeks problem easier.
              // We can't put arrays in sets, so have to stringify.
              if (isWeekRange(weeks)) {
                // TODO: Error output
                // console.error(
                //   `At least one lesson has a WeekRange (not just normal Week array) in module ${modInfo}`,
                // );
                throw new Error(
                  `WeekRange unsupported: Mod ${modInfo.mod} has at least 1 lesson in lessons ${lessons} with WeekRange`,
                );
              } else {
                // No WeekRange, can treat as normal weeks
                const weeksJson = JSON.stringify(weeks);
                uniqueWeeks.add(weeksJson);
                // console.log(weeksJson);
              }
            });
        });
      });
    });

    // Add each unique week list to solver to generate solve string
    Array.from(uniqueWeeks).forEach((uniqueWeek: string, idx: number) => {
      // Reminder: this was necessary to keep the set of unique weeks as small as possible
      const uniqueWeekArr = JSON.parse(uniqueWeek);
      weekSolver.addWeeks(uniqueWeekArr, `uniqueWeekId_${idx}`);
    });

    return weekSolver.generateSmtlib2String();
  }

  /**
   * STEP 2 of solve:
   *  After Z3 solves weeksolve, update the weeksToSimulate variable for
   *  the next solve stage.
   * */
  updateZ3WeeksolveOutput(buffer: string) {
    // General structure
    // sat\n((weeks_to_simulate #b1000000000001))\n"
    const lines = buffer.split('\n');
    if (lines[0] !== 'sat')
      throw new Error(
        'Not SAT for week-solve before timetable solve - unexpected error, please report',
      );

    // Extract binary string
    const line2 = lines[1];
    // Take part after first space, and part before first ) after that
    const binstring = line2.split(' ')[1].split(')')[0];
    // Ignore "#b" in string
    const binary = binstring.substring(2);
    // Create list of weeks that we should simulate
    binary.split('').forEach((c: string, idx: number) => {
      if (c === '1') this.weeksToSimulate.add(idx + 1);
    });
    // console.log(`WEEKS TO SIMULATE [${Array.from(this.weeksToSimulate).join(',')}]`);
  }

  /**
   * STEP 3:
   *  Generate the main SMTLIB2 string representing the timetable solve
   *  across all weeks to simulate.
   * */
  generateTimetableSolveSmtLib2String(randomize = true): string {
    // TODO make all these stages into separate functions

    // Add all the time constraints from each module
    // Go through every lesson and generate all possible unique combinations of lesson weeks
    this.optimizerInput.moduleInfo.forEach((modInfo: ModuleInfoWithConstraints) => {
      Object.keys(modInfo.lessonsGrouped).forEach((lessonType: string) => {
        const lessonsForLessontype: LessonsForLessonType = modInfo.lessonsGrouped[lessonType];
        const slotConstraints: Array<SlotConstraint> = this.moduleLessonsToSlotconstraints(
          modInfo.mod.moduleCode,
          lessonsForLessontype, // TODO fix this function
        );
        if (modInfo.required) {
          this.z3tt.addSlotConstraintsFulfilOnlyOne(slotConstraints);
        } else {
          // Make these slot constraints depend on this module ID (creates a boolean selector based on the mod id)
          this.z3tt.addSlotConstraintsFulfilOnlyOne(slotConstraints, modInfo.mod.moduleCode);
        }
      });
    });

    // Workload constraints
    if (this.optimizerInput.constraints.isWorkloadActive) {
      // Non-compulsory modules make up the if-then-else
      const optionalWorkloads: Array<WorkloadCost> = this.optimizerInput.moduleInfo
        .filter((modInfo: ModuleInfoWithConstraints) => !modInfo.required)
        .map((modInfo: ModuleInfoWithConstraints) => ({
          varname: modInfo.mod.moduleCode,
          cost: parseInt(modInfo.mod.moduleCredit, 10),
        }));
      // Compulsory modules make up the baseline workload
      const compulsoryWorkloadSum: number = this.optimizerInput.moduleInfo
        .filter((modInfo: ModuleInfoWithConstraints) => modInfo.required)
        .map((modInfo: ModuleInfoWithConstraints) => parseInt(modInfo.mod.moduleCredit, 10))
        .reduce((a, n) => a + Number(n), 0);
      // console.log(compulsoryWorkloadSum);
      // Indicate that each boolean selector from the loop above has a cost if chosen
      this.z3tt.setBooleanSelectorCosts(
        optionalWorkloads,
        compulsoryWorkloadSum,
        this.optimizerInput.constraints.minWorkload,
        this.optimizerInput.constraints.maxWorkload,
      );
    }

    // Add requirements for free day: this ensures that we won't get SAT unless an entire day is free
    if (
      this.optimizerInput.constraints.isFreeDayActive ||
      this.optimizerInput.constraints.isSpecificFreeDaysActive
    ) {
      const slotConstraints: Array<SlotConstraint> = this.generateFreeDaySlotconstraints();
      if (this.optimizerInput.constraints.isFreeDayActive) {
        // We fulfil K out of N possible free days based on user selection
        // this.z3tt.add_constraints_fulfil_only_one(slotConstraints);
        this.z3tt.addSlotConstraintsFulfilExactlyN(
          slotConstraints,
          this.optimizerInput.constraints.numRequiredFreeDays,
        );
      }
      if (this.optimizerInput.constraints.isSpecificFreeDaysActive) {
        // We ensure that the days specified are free
        // Assume that the free day slot constraints are in order of day-of-week
        this.optimizerInput.constraints.specificFreeDays.forEach((freeday: string) => {
          const dayIdx = dayStrToIdx(freeday);
          const dayFreedayConstraints = slotConstraints[dayIdx];
          this.z3tt.addSlotConstraintsFulfilOnlyOne([dayFreedayConstraints]);
        });
      }
    }

    // Keep all mods close together
    if (this.optimizerInput.constraints.isPreferCompactTimetable) {
      this.z3tt.addCompactnessConstraint();
    }

    // Allow lunch hours
    if (this.optimizerInput.constraints.isLunchBreakActive) {
      const slotConstraints: Array<SlotConstraint> = this.generateLunchBreakSlotconstraints();
      slotConstraints.forEach((sc: SlotConstraint) => {
        this.z3tt.addNegativevalueSlotConstraintToNConsecutive(
          sc,
          this.optimizerInput.constraints.lunchHalfHours,
        );
      });
    }

    // Start / end too late in the day constraint
    if (this.optimizerInput.constraints.isTimeConstraintActive) {
      const slotConstraint:
        | SlotConstraint
        | undefined = this.generateTimeconstraintSlotconstraint();
      if (slotConstraint !== undefined) {
        // MUST fulfil the single slot constraint generated for the start too early / end too late
        this.z3tt.addSlotConstraintsFulfilOnlyOne([slotConstraint]);
      }
    }
    const smtlib2Str = this.z3tt.generateSmtlib2String(randomize);
    return smtlib2Str;
  }

  /**
   * STEP 4:
   *  Convert the string output by the Z3 solver into an output that the caller can understand
   * */
  z3OutputToTimetable(z3Output: string): OptimizerOutput {
    const parsedExpr: Expr = parse(z3Output);
    // console.log(parsed_expr)

    // We know from smt output that the first line is an ExprNode and not a raw string
    // parsed_expr[0] === {type: "atom", content: "sat", location: {…}}
    const firstLine: ExprNode = parsedExpr[0] as ExprNode;
    const isSat: boolean = firstLine.content === 'sat';
    if (!isSat) return { isSat: false, timetable: {} }; // Nothing to do here

    // parsed_expr[1] === {type: "list", content: Array(19), location: {…}}
    const variableAssignmentsExprs: ExprNode[] = (parsedExpr[1] as ExprNode).content as ExprNode[];
    variableAssignmentsExprs.shift(); // Removes first "model" expr: {type: "atom", content: "model", location: {…}}
    const variableAssignments: Record<string, number> = {};
    variableAssignmentsExprs.forEach((expr) => {
      // Example expr: {type: "list", content: Array(5), location: {…}}
      // Inside Array(5):
      /*  0: {type: "atom", content: "define-fun", location: {…}}
              1: {type: "atom", content: "h33", location: {…}}
              2: {type: "list", content: Array(0), location: {…}}
              3: {type: "atom", content: "Int", location: {…}}
              4: {type: "atom", content: "1024", location: {…}}
          */
      // We assume all model returns values have this structure, and are assigning varnames to ints
      const varName: string = (expr.content[1] as ExprNode).content as string;
      const varValueExpr = ((expr as ExprNode).content[4] as ExprNode).content;
      let varValue = -2;
      // Var_value could be an integer or an expression where the second element is the value of a negative number
      // console.log(var_value_expr)
      if (typeof varValueExpr === 'string') {
        varValue = parseInt(varValueExpr, 10);
      } else {
        varValue = -1 * parseInt((varValueExpr[1] as ExprNode).content as string, 10);
      }

      variableAssignments[varName] = varValue;
    });
    // console.log(variableAssignments);

    // Lessons chosen in the end
    // Raw inputs will be of the form [LSM1301, Lecture, 1]  [LSM1301, Tutorial, 03B]
    // We want that to be {"LSM1301": {"Lecture": 1, "Tutorial": 03B}}
    const lessons: SemTimetableConfig = {};

    // Create the final output timetable based on hour assignments
    Object.keys(variableAssignments).forEach((key: string) => {
      // Hour assignment
      if (key.startsWith('t')) {
        // const keySplit = key.split('_')[0];
        // const halfhouridx = parseInt(keySplit.substr(1), 10);
        // const [offset, day, week] = z3TimeToGenericTime(halfhouridx);
        const val = variableAssignments[key];
        if (val === UNASSIGNED) return; // Un-assigned slot
        const assignment: string = this.ownerIdToStringTable[val];
        if (assignment === undefined) {
          return;
          // throw new Error(`Undefined assignment for variable_assignments[${key}] = ${variable_assignments[key]}`)
        }
        // console.log(`For z3 t${halfhouridx}, offset: ${offset}, day: ${day}, week: ${week}`);
        const lessonDetails = z3VarnameToLessonInfo(assignment);
        nestObject(lessons, lessonDetails);
      }
    });

    // console.log(lessons);
    const output: OptimizerOutput = {
      isSat,
      timetable: lessons,
    };
    return output;
  }

  /**
   * Takes all lessons of a particular type from the module and converts it into a set of slot constraints,
   *  where only one of them need to be fulfilled
   * */
  moduleLessonsToSlotconstraints(
    moduleCode: string,
    lessonsForLessonType: LessonsForLessonType,
  ): Array<SlotConstraint> {
    const scs: Array<SlotConstraint> = [];

    Object.keys(lessonsForLessonType).forEach((classNo: string) => {
      const lessonsForClassNo: readonly RawLesson[] = lessonsForLessonType[classNo];
      // TODO abstract out key generation to function
      const key: string = lessonInfoToZ3Varname(
        moduleCode,
        lessonsForClassNo[0].lessonType,
        lessonsForClassNo[0].classNo,
      );
      const ownerId: Z3LessonID = this.stringToOwnerIdTable[key];
      const startEndTimes: Array<[number, number]> = [];
      // A classNo can have multiple lessons with different startEndTimes (e.g., lecture classNo 01 on Monday and Friday)
      lessonsForClassNo.forEach((lesson: RawLesson) => {
        // If no week calculation, run everything as every week
        // TODO evaluate if this branch is even necessary anymore
        if (this.weeksToSimulate.size === 0) {
          const startTime = this.hhmmToZ3Time(lesson.startTime, lesson.day);
          const endTime = this.hhmmToZ3Time(lesson.endTime, lesson.day);
          startEndTimes.push([startTime, endTime]);
        } else {
          // Only add start-end times for lessons on the weeks that we are actively simulating
          const weeksForLesson = lesson.weeks as NumericWeeks;
          const weeksToSim = weeksForLesson.filter((week: number) =>
            this.weeksToSimulate.has(week),
          );
          // For each week that we need to simulate, calculate the time constraints
          weeksToSim.forEach((week: number) => {
            // console.log(`Simulating week ${week}`);
            const startTime = this.hhmmToZ3Time(lesson.startTime, lesson.day, week - 1);
            const endTime = this.hhmmToZ3Time(lesson.endTime, lesson.day, week - 1);
            startEndTimes.push([startTime, endTime]);
          });
        }
      });
      const sc: SlotConstraint = {
        startEndTimes,
        ownerId,
        ownerString: key,
      };
      scs.push(sc);
    });
    // console.log(scs);
    return scs;
  }

  /**
   * Generates an entire set of slot constraints where the solver is asked to pick exactly 1
   * This ensures that at least 1 day is free.
   * NOTE: this method cares about the start-end of day timeconstraints, and will not generate variables for those slots.
   *       Otherwise, we will get UNSAT when we assert that those times are both free_day slots and too_early / too_late slots
   * */
  generateFreeDaySlotconstraints(): Array<SlotConstraint> {
    const scs: Array<SlotConstraint> = [];
    // For each day of the week, add a slot constraint blocking out the whole day
    // Free Saturday is too easy, remove it
    for (let day = 0; day < DAYS - 1; day++) {
      const name = `FREE_${idxToDayStr(day)}`; // Timeslots for this day will be named FREE_monday for e.g,
      const ownerId = FREE - day; // FREE == -2, so we generate a separate ownerid for each day by subtracting

      // To display the results in the table we need to map the owner ID and reverse tables
      this.stringToOwnerIdTable[name] = ownerId;
      this.ownerIdToStringTable[ownerId] = name;

      let startOffset = 0;
      let endOffset = HOURS_PER_DAY * 2;
      if (this.optimizerInput.constraints.isTimeConstraintActive) {
        startOffset = this.hhmmToZ3Time(this.optimizerInput.constraints.earliestLessonStartTime);
        endOffset = this.hhmmToZ3Time(this.optimizerInput.constraints.latestLessonEndTime);
        // console.log(`Start offset: ${startOffset}, endOffset: ${endOffset}`);
      }

      const startEndIdxs: Array<[number, number]> = [];
      Array.from(this.weeksToSimulate).forEach((week: number) => {
        // Generate the slot constraints for each day
        const startidx =
          (week - 1) * (HOURS_PER_WEEK * 2) + day * (HOURS_PER_DAY * 2) + startOffset;
        const endidx = startidx + (endOffset - startOffset);
        startEndIdxs.push([startidx, endidx]);
      });

      const sc: SlotConstraint = {
        startEndTimes: startEndIdxs,
        ownerId,
        ownerString: name,
      };
      scs.push(sc);
    }
    return scs;
  }

  /**
   * Generates a single slot constraint representing time blocked off for too-early / too-late in the day for classes.
   * */
  generateTimeconstraintSlotconstraint(): SlotConstraint | undefined {
    const startEndTimes: Array<[number, number]> = [];
    const name = 'TOO_EARLY_OR_LATE';
    const ownerId = TOOEARLY_LATE;
    this.stringToOwnerIdTable[name] = ownerId;
    this.ownerIdToStringTable[ownerId] = name;

    // Not even constraining any of the day, ignore
    const startOffset = this.hhmmToZ3Time(this.optimizerInput.constraints.earliestLessonStartTime);
    const endOffset = this.hhmmToZ3Time(this.optimizerInput.constraints.latestLessonEndTime);
    if (startOffset === 0 && endOffset - startOffset === HOURS_PER_DAY * 2) return undefined;
    // For each day of the week, add a slot constraint blocking out hours before and after our ideal timings
    for (let day = 0; day < DAYS; day++) {
      // Compute the two time windows necessary to block off start and end of day
      // Start-of-day time starts at the initial index of the day, up until the offset
      // Do this for every week that we have to simulate
      Array.from(this.weeksToSimulate).forEach((week: number) => {
        const startidx = (week - 1) * (HOURS_PER_WEEK * 2) + day * (HOURS_PER_DAY * 2);
        const startidxEndidx = startidx + startOffset;
        if (startidxEndidx - startidx > 0) {
          startEndTimes.push([startidx, startidxEndidx]);
        }

        const endidx = startidx + HOURS_PER_DAY * 2;
        const endidxStartidx = startidx + endOffset;
        if (endidxStartidx - endidx > 0) {
          startEndTimes.push([startidx, startidxEndidx]);
        }
        startEndTimes.push([endidxStartidx, endidx]);
      });
    }

    const sc: SlotConstraint = {
      startEndTimes,
      ownerId,
      ownerString: name,
    };
    // console.log('Slotconstraints for timeconstraint');
    // console.log(sc);
    return sc;
  }

  /**
   * Generates a set of slotconstraints representing the times that could be blocked off for lunch.
   * */
  generateLunchBreakSlotconstraints(): Array<SlotConstraint> {
    const scs: Array<SlotConstraint> = [];

    // Calculate offsets within the day
    const startOffset = this.hhmmToZ3Time(this.optimizerInput.constraints.lunchStart);
    const endOffset = this.hhmmToZ3Time(this.optimizerInput.constraints.lunchEnd);
    if (startOffset >= endOffset || startOffset < 0)
      throw new Error(`Either startOffset ${startOffset} < 0 or >= endOffset ${endOffset}!`);

    // For each day of the week, add a slot constraint blocking out hours before and after our ideal timings
    for (let day = 0; day < DAYS; day++) {
      // Compute the lunch break window for each day and week
      Array.from(this.weeksToSimulate).forEach((week: number) => {
        const baseidx = (week - 1) * (HOURS_PER_WEEK * 2) + day * (HOURS_PER_DAY * 2);
        const startidx = baseidx + startOffset;
        const endidx = baseidx + endOffset;
        const sc: SlotConstraint = {
          startEndTimes: [[startidx, endidx]],
          ownerId: UNASSIGNED,
          ownerString: 'UNASSIGNED',
        };
        scs.push(sc);
      });
    }

    // console.log('Slotconstraints for lunchbreak');
    // console.log(scs);
    return scs;
  }

  /**
   * Convert a time (hhmm format), the day it occurs, and the week it occurs,
   *  into the integer representation of that timeslot in Z3.
   * There are defined start and end times to reduce the number of variables in Z3.
   *  No point having vars to represent midnight to 8am if no classes are there, same for evening.
   * */
  hhmmToZ3Time(time: LessonTime, day: DayText = 'Monday', week = 0): number {
    const hour = parseInt(time.substring(0, 2), 10);
    const minuteOffset = parseInt(time.substring(2), 10) === 0 ? 0 : 1;
    // We assume lessons within start to end hour each day
    if (
      hour < this.startHour ||
      hour > this.endHour ||
      (hour === this.endHour && minuteOffset === 1)
    ) {
      throw new Error(
        `Lesson either starts before start_hour ${hour} < ${this.startHour} or ends after end_hour ${hour}`,
      );
    } else {
      const hourIndex = hour - this.startHour;
      const dayIndex = dayStrToIdx(day);
      if (dayIndex === undefined) throw new Error(`Day ${day} is not a valid day string!`);
      // hour_index * 2 (since we count half-hours)
      // + half_hour_addon since we offset by 1 unit if it's a half hour
      // + number of hours in a day * 2 to get number of half-hours
      // + number of weeks offset from the "base week"
      const idx =
        hourIndex * 2 + minuteOffset + dayIndex * (HOURS_PER_DAY * 2) + week * (HOURS_PER_WEEK * 2);
      return idx;
    }
  }
}

/*
    Conversion from times like 0 --> (1, 0) (1st slot of the day 0-indexed, Monday)
  */
function z3TimeToGenericTime(z3Time: number): [number, number, number] {
  // Day is easy: each day has(self.end_hour - self.start_hour) * 2) slots
  // If there are 60 slots per week, and we are at slot 70, we're 10 slots into the current week
  const week = Math.floor(z3Time / (HOURS_PER_WEEK * 2));
  const z3TimeWeek = z3Time % (HOURS_PER_WEEK * 2);
  const day = Math.floor(z3TimeWeek / (HOURS_PER_DAY * 2));
  const offset = z3TimeWeek % (HOURS_PER_DAY * 2);
  return [offset, day, week];
}

/**
 * Simple conversion of string into a monday-index-0 number
 * */
function dayStrToIdx(day: string): number {
  return DAY_IDXS[day.toLowerCase()];
}

/**
 * Simple conversion of string into a monday-index-0 number
 * */
function idxToDayStr(idx: number): string {
  return IDX_DAYS[idx];
}

/**
 * Converts a module, lesson type, and class number for a lesson
 *  into a variable name that z3 can use. We have to get the abbreviated name
 *  since
 * */
function lessonInfoToZ3Varname(moduleCode: string, lessonType: string, classNo: string): string {
  const lessonTypeAbbrev = LESSON_TYPE_ABBREV[lessonType];
  return [moduleCode, lessonTypeAbbrev, classNo].join('__');
}

/**
 * Recovers lesson info from z3 variable name
 * */
function z3VarnameToLessonInfo(z3Varname: string): [string, string, string] {
  const [moduleCode, lessonTypeAbbrev, classNo] = z3Varname.split('__');
  const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbrev];
  return [moduleCode, lessonType, classNo];
}

// Assign an array of properties to an object - creating nested levels
// E.g., nestObject({}, [a, b, c]) ==> {a: {b: c}}
// TODO extract to file?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nestObject(obj: any, keyPath: any) {
  let curObj = obj;
  const value = keyPath[keyPath.length - 1];
  const lastKeyIndex = Math.max(0, keyPath.length - 2);
  for (let i = 0; i < lastKeyIndex; ++i) {
    const key = keyPath[i];
    if (!(key in curObj)) {
      curObj[key] = {};
    }
    curObj = curObj[key];
  }
  curObj[keyPath[lastKeyIndex]] = value;
}
