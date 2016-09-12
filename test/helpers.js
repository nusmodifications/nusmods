import { expect } from 'chai';
import * as actions from '../src/js/actions/helpers';

describe('actions', () => {
  it('should return an array', () => {
    const arr = [];
    const expectedAction = {
      type: actions.RESET_REQUEST_STATE,
      payload: arr,
    };
    expect(actions.resetRequestState(arr)).to.deep.equal(expectedAction);
  });
});