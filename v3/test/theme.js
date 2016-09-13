import { expect } from 'chai';
import * as actions from '../src/js/actions/theme';

describe('theme', () => {
  it('changeTheme should dispatch a change of theme', () => {
    const theme = 'test';
  	const expectedAction = {
      type: actions.CHANGE_THEME,
      payload: {
        theme,
      },
    };
    expect(actions.changeTheme(theme)).to.deep.equal(expectedAction);
  });
});
