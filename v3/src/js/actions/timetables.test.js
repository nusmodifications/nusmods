// @flow
import type { ModuleCode, Semester, Lesson } from 'types/modules';
import * as actions from 'actions/timetables';
import lessons from '__mocks__/lessons-array.json';

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
