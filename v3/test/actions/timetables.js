// @flow
// import type { FSA } from 'types/redux';
import type { ModuleCode } from 'types/modules';

import test from 'ava';
// import config from 'config';
import * as actions from 'actions/timetables';

test('addModule should create an action to add a module', (t) => {
  // const semester: Semester = config.semester;
  const moduleCode: ModuleCode = 'CS1010';

  // const expected: FSA = {
  //   type: actions.ADD_MODULE,
  //   payload: {
  //     semester,
  //     moduleCode,
  //   },
  // };
  const value: Function = actions.addModule(moduleCode);
  // not sure how to test dispatch
  t.true(typeof value === 'function');
  // t.deepEqual(value, expected);
});

