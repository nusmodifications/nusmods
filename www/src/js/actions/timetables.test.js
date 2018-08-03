// @flow
import type { ModuleCode, Semester, Lesson } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';

import lessons from '__mocks__/lessons-array.json';

/** @var {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';
/** @var {Module} */
import CS3216 from '__mocks__/modules/CS3216.json';

import * as actions from './timetables';

jest.mock('storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// see: https://github.com/reactjs/redux/blob/master/docs/recipes/WritingTests.md#example-1
// TODO: write addModule test with nock and mockStore.
test('addModule should create an action to add a module', () => {
  const moduleCode: ModuleCode = 'CS1010';
  const semester: Semester = 1;

  const value: Function = actions.addModule(semester, moduleCode);
  // TODO
  expect(typeof value === 'function').toBe(true);
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
  expect(actions.changeLesson(semester, lesson)).toMatchSnapshot();
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
  const moduleBank = { modules: { CS1010S, CS3216 } };
  const timetablesState = (semester: Semester, timetable: SemTimetableConfig) => ({
    lessons: { [semester]: timetable },
  });
  const semester = 1;
  const action = actions.validateTimetable(semester);

  test('do nothing if timetable is already full', () => {
    const timetable = {
      CS1010S: {
        Lecture: '1',
        Tutorial: '1',
        Recitation: '1',
      },
    };

    const state: any = { timetables: timetablesState(semester, timetable), moduleBank };
    const dispatch = jest.fn();
    action(dispatch, () => state);

    expect(dispatch).not.toHaveBeenCalled();
  });

  test('fill missing lessons with randomly generated modules', () => {
    const timetable = {
      CS1010S: {
        Lecture: '1',
        Tutorial: '1',
      },
      CS3216: {},
    };
    const state: any = { timetables: timetablesState(semester, timetable), moduleBank };
    const dispatch = jest.fn();

    action(dispatch, () => state);

    expect(dispatch).toHaveBeenCalledTimes(2);

    const [[firstAction], [secondAction]] = dispatch.mock.calls;
    expect(firstAction).toMatchObject({
      type: actions.SET_LESSON_CONFIG,
      payload: {
        semester,
        moduleCode: 'CS1010S',
        lessonConfig: {
          Lecture: '1',
          Tutorial: '1',
          Recitation: expect.any(String),
        },
      },
    });

    expect(secondAction).toMatchObject({
      type: actions.SET_LESSON_CONFIG,
      payload: {
        semester,
        moduleCode: 'CS3216',
        lessonConfig: {
          Lecture: '1',
        },
      },
    });
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
