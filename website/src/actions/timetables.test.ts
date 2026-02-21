import { ModuleCode, Semester } from 'types/modules';
import { SemTimetableConfig, LessonWithIndex, TimetableConfigV1 } from 'types/timetables';

import lessons from '__mocks__/lessons-array.json';
import { CS1010A, CS1010S, CS3216 } from '__mocks__/modules';

import {
  TaModulesMapV1,
  ModuleBank,
  TimetablesState,
  SemesterColorMap,
  HiddenModulesMap,
  ColorMapping,
} from 'types/reducers';
import { defaultTimetableState } from 'reducers/timetables';
import * as actions from './timetables';

const initialState = defaultTimetableState;

jest.mock('storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// see: https://github.com/reactjs/redux/blob/master/docs/recipes/WritingTests.md#example-1
// TODO: write addModule test with nock and mockStore.
test('addModule should create an action to add a module', () => {
  const moduleCode = 'CS1010';
  const semester = 1;

  const value = actions.addModule(semester, moduleCode);
  // TODO
  expect(value).toBeInstanceOf(Function);
});

test('removeLesson should return information to remove module', () => {
  const semester: Semester = 1;
  const moduleCode: ModuleCode = 'CS1010';
  expect(actions.removeModule(semester, moduleCode)).toMatchSnapshot();
});

test('modifyLesson should return lesson payload', () => {
  const activeLesson: LessonWithIndex = lessons[0];
  expect(actions.modifyLesson(activeLesson)).toMatchSnapshot();
});

test('changeLesson should return updated information to change lesson', () => {
  const semester: Semester = 1;
  const lesson: LessonWithIndex = lessons[1];
  expect(
    actions.changeLesson(semester, lesson.moduleCode, lesson.lessonType, [lesson.lessonIndex]),
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

describe('disabling ta module', () => {
  const semester = 1;
  const timetablesState = (ta: ModuleCode[]): TimetablesState => ({
    ...initialState,
    lessons: {
      [semester]: {
        CS1010S: {
          Lecture: [0],
          Tutorial: [11],
          Recitation: [1],
        },
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
          Lecture: [0],
          Recitation: [1],
          Tutorial: [11],
        },
        moduleCode: 'CS1010S',
        semester: 1,
      },
      type: 'REMOVE_TA_MODULE',
    });
  });

  test('should dispatch action even if semesterData cannot be found to create normal mode lessonConfig', () => {
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
          Lecture: [0],
          Recitation: [1],
          Tutorial: [11],
        },
        moduleCode: 'CS1010S',
        semester: 1,
      },
      type: 'REMOVE_TA_MODULE',
    });
  });
});

describe('fillTimetableBlanks', () => {
  const moduleBank: Partial<ModuleBank> = { modules: { CS1010S, CS1010A, CS3216 } };
  const semester: Semester = 1;
  const timetablesState = (timetable: SemTimetableConfig): TimetablesState => ({
    ...initialState,
    lessons: { [semester]: timetable },
  });
  const action = actions.validateTimetable(semester, () => []);

  test('do nothing if timetable is already full', async () => {
    const timetable = {
      CS1010S: {
        Lecture: [0],
        Tutorial: [11],
        Recitation: [1],
      },
    };

    const state: any = { timetables: timetablesState(timetable), moduleBank };
    const dispatch = jest.fn();
    await expect(action(dispatch, () => state)).resolves.not.toThrow(Error);
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('fill missing lessons with randomly generated modules', async () => {
    const timetable = {
      CS1010S: {
        Lecture: [0],
        Tutorial: [11],
      },
      CS3216: {},
    };
    const state: any = { timetables: timetablesState(timetable), moduleBank };
    const dispatch = jest.fn();
    await expect(action(dispatch, () => state)).resolves.not.toThrow(Error);
    expect(dispatch).toHaveBeenCalledTimes(2);

    const [[firstAction], [secondAction]] = dispatch.mock.calls;
    expect(firstAction).toEqual({
      type: actions.SET_LESSON_CONFIG,
      payload: {
        semester,
        moduleCode: 'CS1010S',
        lessonConfig: {
          Lecture: [0],
          Tutorial: [11],
          Recitation: [1],
        },
      },
    });

    expect(secondAction).toEqual({
      type: actions.SET_LESSON_CONFIG,
      payload: {
        semester,
        moduleCode: 'CS3216',
        lessonConfig: {
          Lecture: [0],
        },
      },
    });
  });

  test('migrate v1 config', async () => {
    const colors: ColorMapping = {
      CS1010S: 0,
      CS3216: 1,
    };
    const hiddenModules: ModuleCode[] = [];
    const timetables = {
      lessons: {
        [semester]: {
          CS1010S: {
            Lecture: '1',
            Tutorial: '1',
            Recitation: '1',
          },
          CS3216: {
            Lecture: '1',
          },
        } as TimetableConfigV1,
      },
      colors: {
        [semester]: colors,
      } as SemesterColorMap,
      hidden: {
        [semester]: hiddenModules,
      } as HiddenModulesMap,
      ta: {
        [semester]: {
          CS1010S: [
            ['Lecture', '1'],
            ['Tutorial', '2'],
            ['Recitation', '2'],
          ],
        },
      } as TaModulesMapV1,
    };

    const state: any = { timetables, moduleBank };
    const dispatch = jest.fn();
    await expect(action(dispatch, () => state)).resolves.not.toThrow(Error);
    expect(dispatch).toHaveBeenCalledTimes(1);
    const [[firstAction]] = dispatch.mock.calls;

    const migratedTimetable: SemTimetableConfig = {
      CS1010S: {
        Lecture: [0],
        Recitation: [3],
        Tutorial: [21],
      },
      CS3216: {
        Lecture: [0],
      },
    };
    const migratedTaModules: ModuleCode[] = ['CS1010S'];

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

  test('should not error when module cannot be found', async () => {
    const timetable = {
      CS1010S: {
        Lecture: [0],
        Tutorial: [11],
        Recitation: [1],
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
    await expect(action(dispatch, () => state)).resolves.not.toThrow(Error);
    expect(dispatch).not.toThrow(TypeError);
  });

  test('should not error when timetable configs are malformed', async () => {
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
    await expect(action(dispatch, () => state)).resolves.not.toThrow(Error);
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
