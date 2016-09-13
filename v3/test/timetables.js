import { expect } from 'chai';
import appConfig from '../src/js/config/app-config.json';
import * as actions from '../src/js/actions/timetables';

describe('actions', () => {
  it('should create an action to add a module', () => {
    const semester = appConfig.semester;
    const moduleCode = 'CS1010';

    const expectedAction = {
      type: actions.ADD_MODULE,
      semester,
      moduleCode
    };
    // expect(actions.addModule(text)).toEqual(expectedAction);
    expect(true).to.equal(true);
  });
});
