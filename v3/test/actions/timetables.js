import test from 'ava';
import appConfig from 'config/app-config.json';
import * as actions from 'actions/timetables';

test('addModule should create an action to add a module', (t) => {
  const semester = appConfig.semester;
  const moduleCode = 'CS1010';

  const expected = {
    type: actions.ADD_MODULE,
    semester,
    moduleCode,
  };
  const value = actions.addModule(moduleCode);
  // not sure how to test dispatch
  t.true(typeof value === 'function');
  // t.deepEqual(value, expected);
});
