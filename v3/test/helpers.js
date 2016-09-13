import { expect } from 'chai';
import * as actions from '../src/js/actions/helpers';

describe('helpers/resetRequestState', () => {
  it('should return an array', () => {
    const arr = [];
    const expectedAction = {
      type: actions.RESET_REQUEST_STATE,
      payload: arr,
    };
    expect(actions.resetRequestState(arr)).to.deep.equal(expectedAction);
  });

  it('should convert item to an array', () => {
    const arr = 'test';
    const expectedAction = {
      type: actions.RESET_REQUEST_STATE,
      payload: [arr],
    };
    expect(actions.resetRequestState(arr)).to.deep.equal(expectedAction);
  });
});

describe('helpers/resetErrorState', () => {
  it('should return an array', () => {
    const arr = [];
    const expectedAction = {
      type: actions.RESET_ERROR_STATE,
      payload: arr,
    };
    expect(actions.resetErrorState(arr)).to.deep.equal(expectedAction);
  });

  it('should convert item to an array', () => {
    const arr = 'test';
    const expectedAction = {
      type: actions.RESET_ERROR_STATE,
      payload: [arr],
    };
    expect(actions.resetErrorState(arr)).to.deep.equal(expectedAction);
  });
});

describe('helpers/resetAllState', () => {
  it('should reset state', () => {
    const expectedAction = {
      type: actions.RESET_ALL_STATE
    };
    expect(actions.resetAllState()).to.deep.equal(expectedAction);
  });
});
