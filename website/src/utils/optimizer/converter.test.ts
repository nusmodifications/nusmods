import { OptimizerInputSmtlibConverter } from 'utils/optimizer/converter';
import { Z3WeekSolver } from 'utils/optimizer/z3WeekSolver';
import { Z3TimetableSolver } from 'utils/optimizer/z3TimetableSolver';
import {
  OptimizerInput,
  ModuleInfoWithConstraints,
  defaultConstraints,
  lessonByGroupsByClassNo,
  GlobalConstraints,
  SlotConstraint,
} from 'types/optimizer';
import { RawLesson } from 'types/modules';
import { getModuleTimetable } from 'utils/modules';
import { CS3216, GES1021, BFS1001 } from '__mocks__/modules';

// Directly mock the converter functions, allows us to track them
const mockAddWeeks = jest.fn();
const mockGenerateSmtlib2String = jest.fn();
jest.mock('utils/optimizer/z3WeekSolver', () =>
  // Works and lets you check for constructor calls:
  ({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Z3WeekSolver: jest.fn().mockImplementation(() => ({
      addWeeks: mockAddWeeks,
      generateSmtlib2String: mockGenerateSmtlib2String,
    })),
  }),
);

const mockAddSlotConstraintsFulfilOnlyOne = jest.fn();
const mockGenerateTimetableSolveSmtLib2String = jest.fn();
const mockSetBooleanSelectorCosts = jest.fn();
const mockAddSlotConstraintsFulfilExactlyN = jest.fn();
const mockAddNegativevalueSlotConstraintToNConsecutive = jest.fn();
jest.mock('utils/optimizer/z3TimetableSolver', () =>
  // Works and lets you check for constructor calls:
  ({
    UNASSIGNED: -1,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Z3TimetableSolver: jest.fn().mockImplementation(() => ({
      addSlotConstraintsFulfilOnlyOne: mockAddSlotConstraintsFulfilOnlyOne,
      setBooleanSelectorCosts: mockSetBooleanSelectorCosts,
      addSlotConstraintsFulfilExactlyN: mockAddSlotConstraintsFulfilExactlyN,
      addNegativevalueSlotConstraintToNConsecutive: mockAddNegativevalueSlotConstraintToNConsecutive,
      generateSmtlib2String: mockGenerateTimetableSolveSmtLib2String,
    })),
  }),
);

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Jest will fix this for us
  Z3WeekSolver.mockClear();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Jest will fix this for us
  Z3TimetableSolver.mockClear();
});

const emptyModuleInfo: ModuleInfoWithConstraints[] = [];
const emptyOptimizerInput: OptimizerInput = {
  moduleInfo: emptyModuleInfo,
  constraints: defaultConstraints,
};
const modCS3216: ModuleInfoWithConstraints = {
  mod: CS3216,
  required: true,
  lessonsGrouped: lessonByGroupsByClassNo(getModuleTimetable(CS3216, 1)),
};
const modGES1021: ModuleInfoWithConstraints = {
  mod: GES1021,
  required: true,
  lessonsGrouped: lessonByGroupsByClassNo(getModuleTimetable(GES1021, 1)),
};
const modBFS1001: ModuleInfoWithConstraints = {
  mod: BFS1001,
  required: true,
  lessonsGrouped: lessonByGroupsByClassNo(getModuleTimetable(BFS1001, 1)),
};

const cs3216onlyOptimizerInput: OptimizerInput = {
  moduleInfo: [modCS3216],
  constraints: defaultConstraints,
};
const ges1021cs3216OptimizerInput: OptimizerInput = {
  moduleInfo: [modCS3216, modGES1021],
  constraints: defaultConstraints,
};
const bfs1001OptimizerInput: OptimizerInput = {
  moduleInfo: [modBFS1001],
  constraints: defaultConstraints,
};

describe('constructor', () => {
  it('fails when the start hour exceeds the end hour', () => {
    const startHour = 5;
    const endHour = 1;
    expect(
      () => new OptimizerInputSmtlibConverter(emptyOptimizerInput, 10, startHour, endHour),
    ).toThrow();
  });
  it('fails when the start hour equals the end hour', () => {
    const startHour = 5;
    const endHour = 5;
    expect(
      () => new OptimizerInputSmtlibConverter(emptyOptimizerInput, 10, startHour, endHour),
    ).toThrow();
  });

  it('fails when the number of half-hour slots is <= 0', () => {
    const halfHourSlots = -1;
    expect(
      () => new OptimizerInputSmtlibConverter(emptyOptimizerInput, halfHourSlots, 1, 10),
    ).toThrow();
  });

  it('creates and calls solver with the right time string values for valid hours configurations', () => {
    // eslint-disable-next-line no-new
    new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    expect(Z3TimetableSolver).toHaveBeenCalledWith(2, ['monday_0100_wk0', 'monday_0130_wk0']);
  });

  it('creates right owner id tables for a simple module', () => {
    const conv = new OptimizerInputSmtlibConverter(cs3216onlyOptimizerInput, 2, 1, 3);
    expect(conv.ownerIdToStringTable).toEqual({ '0': 'CS3216__LEC__1' });
    expect(conv.stringToOwnerIdTable).toEqual({ CS3216__LEC__1: 0 });
  });

  it('creates right owner id tables for two modules', () => {
    const conv = new OptimizerInputSmtlibConverter(ges1021cs3216OptimizerInput, 2, 1, 3);
    expect(conv.ownerIdToStringTable).toEqual({
      '0': 'CS3216__LEC__1',
      '1048576': 'GES1021__LEC__SL1',
    });
    expect(conv.stringToOwnerIdTable).toEqual({ CS3216__LEC__1: 0, GES1021__LEC__SL1: 1048576 });
  });
});

describe('generateWeekSolveSmtLib2String', () => {
  it('errors if any lesson has a WeekRange instead of a list of week (NumericWeeks)', () => {
    const lessonWithWeekRange: RawLesson = {
      classNo: '01',
      lessonType: 'Lecture',
      day: 'Monday',
      startTime: '1000',
      endTime: '1200',
      venue: 'placeholder',
      weeks: {
        start: 'placeholder',
        end: 'placeholder',
        weeks: [1, 2, 5, 8],
      },
    };
    const modWithWeekRange: ModuleInfoWithConstraints = {
      mod: GES1021,
      required: true,
      lessonsGrouped: { Lecture: { '01': [lessonWithWeekRange] } },
    };
    const modWithWeekRangeOptimizerInput: OptimizerInput = {
      moduleInfo: [modWithWeekRange],
      constraints: defaultConstraints,
    };
    const conv = new OptimizerInputSmtlibConverter(modWithWeekRangeOptimizerInput, 2, 1, 3);
    expect(() => conv.generateWeekSolveSmtLib2String()).toThrow();
  });

  it('generate appropriate week range sets to pass to the week optimizer for normal use cases', () => {
    // Has lessons with 2 unique week configs, weeks 1 - 6, and 7 - 13. We should only pass two into mockAddWeeks.
    const conv = new OptimizerInputSmtlibConverter(bfs1001OptimizerInput, 2, 1, 3);
    conv.generateWeekSolveSmtLib2String();
    expect(mockAddWeeks).toBeCalledTimes(2);
    expect(mockAddWeeks).toBeCalledWith([1, 2, 3, 4, 5, 6], 'uniqueWeekId_0');
    expect(mockAddWeeks).toBeCalledWith([7, 8, 9, 10, 11, 12, 13], 'uniqueWeekId_1');
  });
});

describe('updateZ3WeeksolveOutput', () => {
  it('throws an error if the weeksolve result was unsat (not supposed to happen ever)', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    const testOutput = 'unsat';
    expect(() => conv.updateZ3WeeksolveOutput(testOutput)).toThrow();
  });
  it('throws an error if the weeksolve result was unsat with newline (not supposed to happen ever)', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    const testOutput = 'unsat\n';
    expect(() => conv.updateZ3WeeksolveOutput(testOutput)).toThrow();
  });
  it('updates the weeks to solve variable correctly if only the first week was chosen', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    const testOutput = 'sat\n((weeks_to_simulate #b1000000000000))\n';
    conv.updateZ3WeeksolveOutput(testOutput);
    expect(conv.weeksToSimulate).toEqual(
      new Set<number>([1]),
    );
  });
  it('updates the weeks to solve variable correctly if only the last (13th) week was chosen', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    const testOutput = 'sat\n((weeks_to_simulate #b0000000000001))\n';
    conv.updateZ3WeeksolveOutput(testOutput);
    expect(conv.weeksToSimulate).toEqual(
      new Set<number>([13]),
    );
  });
  it('updates the weeks to solve variable correctly some random weeks are chosen', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    const testOutput = 'sat\n((weeks_to_simulate #b0100001001001))\n';
    conv.updateZ3WeeksolveOutput(testOutput);
    expect(conv.weeksToSimulate).toEqual(
      new Set<number>([2, 7, 10, 13]),
    );
  });
});

describe('hhmmToZ3Time', () => {
  it('errors when the time is earlier than the lesson start time', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    expect(() => conv.hhmmToZ3Time('0000', 'Monday')).toThrow();
    expect(() => conv.hhmmToZ3Time('0030', 'Monday')).toThrow();
  });
  it('errors when the time is later than the lesson end time', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    expect(() => conv.hhmmToZ3Time('0400', 'Monday')).toThrow();
    expect(() => conv.hhmmToZ3Time('0430', 'Monday')).toThrow();
  });
  it('errors when the day of the week is wrong', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    expect(() => conv.hhmmToZ3Time('0200', 'funday')).toThrow();
  });
  it('produces the right time for a valid time range within Monday', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    let timeIdx = conv.hhmmToZ3Time('0100', 'Monday');
    expect(timeIdx).toEqual(0);
    timeIdx = conv.hhmmToZ3Time('0130', 'Monday');
    expect(timeIdx).toEqual(1);
    timeIdx = conv.hhmmToZ3Time('0200', 'Monday');
    expect(timeIdx).toEqual(2);
    timeIdx = conv.hhmmToZ3Time('0230', 'Monday');
    expect(timeIdx).toEqual(3);
  });
  it('produces the right time for a valid time range for another day of the week', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    let timeIdx = conv.hhmmToZ3Time('0100', 'Thursday');
    expect(timeIdx).toEqual(84); // Defined by the hours per day constant (22 - 08 = 14) * 2 (half hours) * 3 days
    timeIdx = conv.hhmmToZ3Time('0130', 'Thursday');
    expect(timeIdx).toEqual(85);
    timeIdx = conv.hhmmToZ3Time('0200', 'Thursday');
    expect(timeIdx).toEqual(86);
    timeIdx = conv.hhmmToZ3Time('0230', 'Thursday');
    expect(timeIdx).toEqual(87);
  });
  it('produces the right time for a valid time range for another day of the week for specified week (2)', () => {
    const conv = new OptimizerInputSmtlibConverter(emptyOptimizerInput, 2, 1, 3);
    let timeIdx = conv.hhmmToZ3Time('0100', 'Thursday', 2);
    expect(timeIdx).toEqual(420); // Defined by the hours per day constant (22 - 08 = 14) * 2 (half hours) * 6 days per week * 2 weeks + 84 from previous test
    timeIdx = conv.hhmmToZ3Time('0130', 'Thursday', 2);
    expect(timeIdx).toEqual(421);
    timeIdx = conv.hhmmToZ3Time('0200', 'Thursday', 2);
    expect(timeIdx).toEqual(422);
    timeIdx = conv.hhmmToZ3Time('0230', 'Thursday', 2);
    expect(timeIdx).toEqual(423);
  });
});

const lunchBreakErrConstraintStart: GlobalConstraints = {
  ...defaultConstraints,
  lunchStart: '0000',
};
const lunchBreakErrConstraintEnd: GlobalConstraints = {
  ...defaultConstraints,
  lunchStart: '0200',
  lunchEnd: '0130',
};
const lunchBreakShort: GlobalConstraints = {
  ...defaultConstraints,
  lunchStart: '0100',
  lunchEnd: '0200',
};
describe('generateLunchBreakSlotconstraints', () => {
  it('errors when the lunch start / end times are impossible', () => {
    let conv = new OptimizerInputSmtlibConverter(
      { ...emptyOptimizerInput, constraints: lunchBreakErrConstraintStart },
      2,
      1,
      3,
    );
    expect(() => conv.generateLunchBreakSlotconstraints()).toThrow();
    conv = new OptimizerInputSmtlibConverter(
      { ...emptyOptimizerInput, constraints: lunchBreakErrConstraintEnd },
      2,
      1,
      3,
    );
    expect(() => conv.generateLunchBreakSlotconstraints()).toThrow();
  });

  it('generates the right output  for minimal lunch break hours', () => {
    const conv = new OptimizerInputSmtlibConverter(
      { ...emptyOptimizerInput, constraints: lunchBreakShort },
      2,
      1,
      3,
    );
    conv.weeksToSimulate = new Set([1]); // at least add one week to simulate
    const scs: SlotConstraint[] = conv.generateLunchBreakSlotconstraints();
    // Computed from the indices of all start times within the week
    expect(scs).toEqual([
      { ownerId: -1, ownerString: 'UNASSIGNED', startEndTimes: [[0, 2]] },
      { ownerId: -1, ownerString: 'UNASSIGNED', startEndTimes: [[28, 30]] },
      { ownerId: -1, ownerString: 'UNASSIGNED', startEndTimes: [[56, 58]] },
      { ownerId: -1, ownerString: 'UNASSIGNED', startEndTimes: [[84, 86]] },
      { ownerId: -1, ownerString: 'UNASSIGNED', startEndTimes: [[112, 114]] },
      { ownerId: -1, ownerString: 'UNASSIGNED', startEndTimes: [[140, 142]] },
    ]);
  });
});

const lessonTimeErrConstraintStart: GlobalConstraints = {
  ...defaultConstraints,
  earliestLessonStartTime: '0000',
};
const lessonTimeErrConstraintEnd: GlobalConstraints = {
  ...defaultConstraints,
  earliestLessonStartTime: '0200',
  latestLessonEndTime: '0100',
};
// const lessonTimeConstraint: GlobalConstraints = {
//   ...defaultConstraints,
//   earliestLessonStartTime: '0100',
//   latestLessonEndTime: '0200',
// };
describe('generateTimeconstraintSlotconstraint', () => {
  it('errors when the lesson constraint start / end times are impossible', () => {
    let conv = new OptimizerInputSmtlibConverter(
      { ...emptyOptimizerInput, constraints: lessonTimeErrConstraintStart },
      2,
      1,
      3,
    );
    expect(() => conv.generateTimeconstraintSlotconstraint()).toThrow();
    conv = new OptimizerInputSmtlibConverter(
      { ...emptyOptimizerInput, constraints: lessonTimeErrConstraintEnd },
      2,
      1,
      3,
    );
    expect(() => conv.generateTimeconstraintSlotconstraint()).toThrow();
  });
});
