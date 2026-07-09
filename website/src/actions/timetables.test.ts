import { Module, ModuleCode, ModuleLessonMap, RawLesson, Semester } from 'types/modules';
import {
  SemTimetableConfig,
  Lesson,
  ModuleLessonConfig,
  TimetableConfig,
  TimetableConfigV2,
  SemTimetableConfigV1,
} from 'types/timetables';

import lessons from '__mocks__/lessons-array.json';
import { CS1010A, CS1010S, CS3216, CS4243 } from '__mocks__/modules';

import { OPEN_NOTIFICATION } from './app';
import {
  TaModulesMapV1,
  ModuleBank,
  TimetablesState,
  SemesterColorMap,
  HiddenModulesMap,
  ColorMapping,
} from 'types/reducers';
import { defaultTimetableState } from 'reducers/timetables';
import { serializeLessonDetails } from 'utils/timetables';

import * as actions from './timetables';

import * as moduleBankActions from 'actions/moduleBank';
import * as modulesUtils from 'utils/modules';
import * as timetablesUtils from 'utils/timetables';

const jest = vi;
const initialState = defaultTimetableState;

vi.mock('storage', () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

describe(actions.addModule, () => {
  const semester: Semester = 1;
  const moduleCode: ModuleCode = 'CS1010';

  beforeEach(() => {
    vi.spyOn(moduleBankActions, 'fetchModule').mockImplementation(
      () => () => Promise.resolve({} as Module),
    );

    vi.spyOn(modulesUtils, 'getModuleLessonMap').mockReturnValue({} as ModuleLessonMap<RawLesson>);

    vi.spyOn(timetablesUtils, 'randomModuleLessonConfig').mockReturnValue({} as ModuleLessonConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('dispatches addModule when the module exists', async () => {
    const state: any = {
      moduleBank: {
        modules: {
          [moduleCode]: { moduleCode },
        },
      },
    };

    const dispatch = vi.fn().mockResolvedValue(undefined);
    await actions.addModule(semester, moduleCode)(dispatch, () => state);
    expect(dispatch).toHaveBeenCalledTimes(2);
    const [, [secondAction]] = dispatch.mock.calls;

    expect(secondAction).toEqual(
      actions.Internal.addModule(semester, moduleCode, expect.any(Object)),
    );
  });

  test('dispatches a notification when the module cannot be loaded', async () => {
    const state: any = {
      moduleBank: {
        modules: {},
      },
    };

    const dispatch = vi.fn().mockResolvedValue(undefined);
    await actions.addModule(semester, moduleCode)(dispatch, () => state);
    expect(dispatch).toHaveBeenCalledTimes(2);
    const [, [secondAction]] = dispatch.mock.calls;

    expect(secondAction).toEqual({
      type: OPEN_NOTIFICATION,
      payload: {
        message: `Cannot load ${moduleCode}`,
        action: expect.objectContaining({
          text: 'Retry',
        }),
      },
    });
  });
});

describe('timetable slot thunks', () => {
  // Two slots for semester 1: '0' (inactive, holds CS1010S) and '1' (active, blank)
  const slotState: any = {
    moduleBank: { moduleCodes: {}, modules: {} },
    timetables: {
      ...initialState,
      lessons: { [1]: {} },
      slots: {
        [1]: [
          {
            id: '0',
            title: 'Timetable 1',
            data: { lessons: { CS1010S: {} }, colors: { CS1010S: 0 }, hidden: [], ta: [] },
          },
          { id: '1', title: 'Timetable 2', data: { lessons: {}, colors: {}, hidden: [], ta: [] } },
        ],
      },
      activeSlot: { [1]: '1' },
    },
  };

  // Dispatch mock that executes thunks so nested fetch/validate thunks run
  const makeDispatch = (state: any) => {
    const dispatch: any = vi.fn((action) =>
      typeof action === 'function' ? action(dispatch, () => state) : action,
    );
    return dispatch;
  };

  // The timetable cannot render modules missing from the module bank, so the
  // incoming slot's modules must be fetched before its data is loaded into
  // the live timetable
  const actionTypes = (dispatch: any) =>
    dispatch.mock.calls.map(([action]: [any]) =>
      typeof action === 'function' ? 'thunk' : action.type,
    );

  test('switchTimetableSlot should fetch slot modules before switching', async () => {
    const dispatch = makeDispatch(slotState);
    await actions.switchTimetableSlot(1, '0')(dispatch, () => slotState);

    expect(dispatch).toHaveBeenCalledWith(actions.Internal.switchTimetableSlot(1, '0'));

    const calls = actionTypes(dispatch);
    const switchIndex = calls.indexOf(actions.SWITCH_TIMETABLE_SLOT);
    expect(calls.slice(0, switchIndex)).toContain('thunk');
  });

  test('deleteTimetableSlot should fetch neighbouring slot modules before deleting', async () => {
    const dispatch = makeDispatch(slotState);
    await actions.deleteTimetableSlot(1, '1')(dispatch, () => slotState);

    expect(dispatch).toHaveBeenCalledWith(actions.Internal.deleteTimetableSlot(1, '1'));

    const calls = actionTypes(dispatch);
    const deleteIndex = calls.indexOf(actions.DELETE_TIMETABLE_SLOT);
    expect(calls.slice(0, deleteIndex)).toContain('thunk');
  });
});

test('removeLesson should return information to remove module', () => {
  const semester: Semester = 1;
  const moduleCode: ModuleCode = 'CS1010';
  expect(actions.removeModule(semester, moduleCode)).toMatchSnapshot();
});

test('modifyLesson should return lesson payload', () => {
  const activeLesson: Lesson = lessons[0];
  expect(actions.modifyLesson(activeLesson)).toMatchSnapshot();
});

test('changeLesson should return updated information to change lesson', () => {
  const semester: Semester = 1;
  const lesson: Lesson = lessons[1];
  expect(
    actions.changeLesson(semester, lesson.moduleCode, lesson.lessonType, [
      serializeLessonDetails(lesson),
    ]),
  ).toMatchSnapshot();
});

test('cancelModifyLesson should not have payload', () => {
  expect(actions.cancelModifyLesson()).toMatchSnapshot();
});

test('select module color should dispatch a select of module color', () => {
  const semester: Semester = 1;
  expect(actions.selectModuleColor(semester, 'CS1010S', 0)).toMatchSnapshot();
  expect(actions.selectModuleColor(semester, 'CS3216', 1)).toMatchSnapshot();
});

describe('fillTimetableBlanks', () => {
  const moduleBank: Partial<ModuleBank> = { modules: { CS1010S, CS1010A, CS3216, CS4243 } };
  const semester: Semester = 1;
  const timetablesState = (timetable: SemTimetableConfig): TimetablesState => ({
    ...initialState,
    lessons: { [semester]: timetable },
  });
  const action = actions.validateTimetable(semester);

  test('do nothing if timetable is already full', () => {
    const timetable: SemTimetableConfig = {
      CS1010S: {
        Lecture: ['1'],
        Recitation: ['2'],
        Tutorial: ['3'],
      },
    };

    const state: any = { timetables: timetablesState(timetable), moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('fill non-TA modules that has missing lessons with first classNo, ignore TA modules with missing lessons', () => {
    const timetable: SemTimetableConfig = {
      CS1010S: {
        Lecture: ['1'],
        Tutorial: ['3'],
      },
      CS4243: {
        Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
      },
    };
    const state: any = {
      timetables: {
        ...initialState,
        lessons: {
          [semester]: timetable,
        },
        ta: {
          [semester]: ['CS4243'],
        },
      } as TimetablesState,
      moduleBank,
    };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    expect(dispatch).toHaveBeenCalledTimes(1);

    const [[firstAction]] = dispatch.mock.calls;
    expect(firstAction).toStrictEqual({
      type: actions.SET_LESSON_CONFIG,
      payload: {
        semester,
        moduleCode: 'CS1010S',
        lessonConfig: {
          Lecture: ['1'],
          Recitation: ['1'],
          Tutorial: ['3'],
        } satisfies ModuleLessonConfig,
      },
    });
  });

  test('should not change v3 config', () => {
    const colors: ColorMapping = {
      CS1010S: 0,
      CS4243: 1,
    };
    const hiddenModules: ModuleCode[] = [];
    const taModules = ['CS4243'];
    const timetables = {
      lessons: {
        [semester]: {
          CS1010S: {
            Lecture: ['1'],
            Recitation: ['2'],
            Tutorial: ['3'],
          },
          CS4243: {
            Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
            Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          },
        },
      } satisfies TimetableConfig,
      colors: {
        [semester]: colors,
      },
      hidden: {
        [semester]: hiddenModules,
      },
      ta: {
        [semester]: taModules,
      },
    };

    const state: any = { timetables, moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    expect(dispatch).toHaveBeenCalledTimes(0);
  });

  test('migrate v2 config', () => {
    const colors: ColorMapping = {
      CS1010S: 0,
      CS4243: 1,
    };
    const hiddenModules: ModuleCode[] = [];
    const taModules = ['CS4243'];
    const timetables = {
      lessons: {
        [semester]: {
          CS1010S: {
            Lecture: [0],
            Recitation: [3],
            Tutorial: [30],
          },
          CS4243: {
            Laboratory: [1],
            Lecture: [5],
          },
        },
      } satisfies TimetableConfigV2,
      colors: {
        [semester]: colors,
      },
      hidden: {
        [semester]: hiddenModules,
      },
      ta: {
        [semester]: taModules,
      },
    };

    const state: any = { timetables, moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    expect(dispatch).toHaveBeenCalledTimes(1);
    const [[firstAction]] = dispatch.mock.calls;

    const migratedTimetable: SemTimetableConfig = {
      CS1010S: {
        Lecture: ['1'],
        Recitation: ['2'],
        Tutorial: ['3'],
      },
      CS4243: {
        Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
        Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
    };

    expect(firstAction).toEqual({
      type: 'SET_TIMETABLE',
      payload: {
        semester,
        timetable: migratedTimetable,
        colors,
        hiddenModules,
        taModules,
      },
    });
  });

  test('migrate v1 config', () => {
    const colors: ColorMapping = {
      CS1010S: 0,
      CS4243: 1,
    };
    const hiddenModules: ModuleCode[] = [];
    const timetables = {
      lessons: {
        [semester]: {
          CS1010S: {
            Lecture: '1',
            Recitation: '2',
            Tutorial: '3',
          },
          CS4243: {
            Laboratory: '1',
            Lecture: '1',
          },
        } satisfies SemTimetableConfigV1,
      },
      colors: {
        [semester]: colors,
      } satisfies SemesterColorMap,
      hidden: {
        [semester]: hiddenModules,
      } satisfies HiddenModulesMap,
      ta: {
        [semester]: {
          CS4243: [
            ['Laboratory', '2'],
            ['Lecture', '1'],
          ],
        },
      } satisfies TaModulesMapV1,
    };

    const state: any = { timetables, moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    expect(dispatch).toHaveBeenCalledTimes(1);
    const [[firstAction]] = dispatch.mock.calls;

    const migratedTimetable: SemTimetableConfig = {
      CS1010S: {
        Lecture: ['1'],
        Recitation: ['2'],
        Tutorial: ['3'],
      },
      CS4243: {
        Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
        Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
    };
    const migratedTaModules: ModuleCode[] = ['CS4243'];

    expect(firstAction).toEqual({
      type: 'SET_TIMETABLE',
      payload: {
        semester,
        timetable: migratedTimetable,
        colors,
        hiddenModules,
        taModules: migratedTaModules,
      },
    });
  });

  test('should not error when module cannot be found', () => {
    const timetable: SemTimetableConfig = {
      CS1010S: {
        Lecture: ['1'],
        Recitation: ['2'],
        Tutorial: ['3'],
      },
    };
    const moduleBankWithoutModule = {
      ...moduleBank,
      modules: {},
    };

    const state: any = {
      timetables: timetablesState(timetable),
      moduleBank: moduleBankWithoutModule,
    };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    expect(dispatch).not.toThrow(TypeError);
  });

  test('should not error when timetable configs are malformed', () => {
    const timetable = {
      CS1010S: {
        Lecture: [undefined],
        Tutorial: ['1'],
        Recitation: [null],
      },
    };
    const timetables = {
      ...initialState,
      lessons: { [semester]: timetable },
    };
    const state: any = { timetables, moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    expect(dispatch).not.toThrow(TypeError);
  });
});

describe('hide/show timetable modules', () => {
  const semester: Semester = 1;

  test('should dispatch a module code for hiding', () => {
    const moduleCode: ModuleCode = 'CS1010';
    expect(actions.hideLessonInTimetable(semester, moduleCode)).toMatchSnapshot();
  });

  test('should dispatch a module code for showing', () => {
    const moduleCode: ModuleCode = 'CS1020';
    expect(actions.showLessonInTimetable(semester, moduleCode)).toMatchSnapshot();
  });
});

describe(actions.fetchTimetableModules, () => {
  const moduleCodes: any = {
    CS1010S: {},
  };

  const state: any = {
    moduleBank: {
      moduleCodes,
    },
  };

  const dispatch = jest.fn().mockResolvedValue(undefined);
  const getState = jest.fn().mockReturnValue(state);

  beforeEach(() => {
    dispatch.mockClear();
    getState.mockClear();
  });

  test('should fetch modules', async () => {
    const timetable = {
      CS1010S: {},
    };

    const thunk = actions.fetchTimetableModules([timetable]);
    expect(thunk).toBeInstanceOf(Function);

    await thunk(dispatch, getState);

    expect(dispatch).toBeCalled();
    expect(dispatch.mock.calls).toMatchSnapshot();
  });

  test('should not fetch invalid modules', async () => {
    const timetable = {
      invalid: {},
    };

    const thunk = actions.fetchTimetableModules([timetable]);
    await thunk(dispatch, getState);
    expect(dispatch).not.toBeCalled();
  });
});

describe(actions.enableTaModule, () => {
  const semester = 1;
  const action = actions.enableTaModule(semester, CS4243.moduleCode);

  const moduleBank = { modules: { CS4243 } };

  test('should add module, converting classNo to corresponding lessonId', () => {
    const timetables: any = {
      lessons: {
        [semester]: {
          CS4243: {
            Laboratory: ['2'],
            Lecture: ['1'],
          },
        },
      },
      ta: {
        [semester]: [],
      },
    };

    const state: any = { timetables, moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    const [[firstAction]] = dispatch.mock.calls;
    expect(firstAction).toStrictEqual({
      type: 'ADD_TA_MODULE',
      payload: {
        semester,
        moduleCode: CS4243.moduleCode,
        lessonConfig: {
          Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
          Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        },
      },
    });
  });

  test('should add module and use current config if config is already lessonId', () => {
    const timetables: any = {
      lessons: {
        [semester]: {
          CS4243: {
            Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
            Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          },
        },
      },
      ta: {
        [semester]: [],
      },
    };

    const state: any = { timetables, moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    const [[firstAction]] = dispatch.mock.calls;
    expect(firstAction).toStrictEqual({
      type: 'ADD_TA_MODULE',
      payload: {
        semester,
        moduleCode: CS4243.moduleCode,
        lessonConfig: {
          Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
          Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        },
      },
    });
  });

  test('should add module even when semesterData is missing', () => {
    const moduleBank = {
      modules: {
        CS4243: {
          ...CS4243,
          semesterData: [],
        },
      },
    };
    const timetables: any = {
      lessons: {
        [semester]: {
          CS4243: {
            Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
            Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          },
        },
      },
      ta: {
        [semester]: [],
      },
    };

    const state: any = { timetables, moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);
    const [[firstAction]] = dispatch.mock.calls;
    expect(firstAction).toStrictEqual({
      type: 'ADD_TA_MODULE',
      payload: {
        semester,
        moduleCode: CS4243.moduleCode,
        lessonConfig: {},
      },
    });
  });
});

describe(actions.disableTaModule, () => {
  const semester = 1;
  const timetablesState = (ta: ModuleCode[]): TimetablesState => ({
    ...initialState,
    lessons: {
      [semester]: {
        CS1010S: {
          Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          Recitation: ['2|THU|1300|1400|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          Tutorial: ['3|MON|1100|1200|COM1-0217|3_4_5_6_7_8_9_10_11_12_13'],
        } satisfies ModuleLessonConfig,
      },
    },
    ta: { [semester]: ta },
  });

  test('should dispatch action to remove the module', () => {
    const ta = ['CS1010S'];

    const state: any = {
      timetables: timetablesState(ta),
      moduleBank: { modules: { CS1010S, CS3216 } },
    };
    const dispatch = jest.fn();
    const action = actions.disableTaModule(semester, 'CS1010S');
    action(dispatch, () => state);
    const [[firstAction]] = dispatch.mock.calls;

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(firstAction).toEqual({
      payload: {
        lessonConfig: {
          Lecture: ['1'],
          Recitation: ['2'],
          Tutorial: ['3'],
        } satisfies ModuleLessonConfig,
        moduleCode: 'CS1010S',
        semester: 1,
      },
      type: 'REMOVE_TA_MODULE',
    });
  });

  test('should dispatch action with serializedLessonDetails lessonId if semesterData cannot be found to create non-TA lessonConfig', () => {
    const ta = ['CS1010S'];

    const state: any = {
      timetables: timetablesState(ta),
      moduleBank: { modules: { CS1010S: { semesterData: [] } } },
    };
    const dispatch = jest.fn();
    const action = actions.disableTaModule(semester, 'CS1010S');
    action(dispatch, () => state);
    const [[firstAction]] = dispatch.mock.calls;

    expect(dispatch).toHaveBeenCalled();
    expect(firstAction).toEqual({
      payload: {
        lessonConfig: {
          Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          Recitation: ['2|THU|1300|1400|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          Tutorial: ['3|MON|1100|1200|COM1-0217|3_4_5_6_7_8_9_10_11_12_13'],
        } satisfies ModuleLessonConfig,
        moduleCode: 'CS1010S',
        semester: 1,
      },
      type: 'REMOVE_TA_MODULE',
    });
  });
});
