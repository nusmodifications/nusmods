// @flow
import type { FSA } from 'types/redux';

import * as actions from 'actions/helpers';

function testShouldReturnArr(type, action): void {
  const payload: Array<any> = [];
  const expectedResult: FSA = {
    type,
    payload,
  };
  const resultOfAction: FSA = action(payload);
  expect(resultOfAction).toEqual(expectedResult);
}

test('resetRequestState should return an array', () => {
  testShouldReturnArr(actions.RESET_REQUEST_STATE, actions.resetRequestState);
});

test('resetErrorState should return an array', () => {
  testShouldReturnArr(actions.RESET_ERROR_STATE, actions.resetErrorState);
});

function testShouldConvertArr(type, action): void {
  const payload: string = 'test';
  const expectedResult: FSA = {
    type,
    payload: [payload],
  };
  const resultOfAction: FSA = action(payload);
  expect(resultOfAction).toEqual(expectedResult);
}

test('resetRequestState should convert item to an array', () => {
  testShouldConvertArr(actions.RESET_REQUEST_STATE, actions.resetRequestState);
});

test('resetErrorState should convert item to an array', () => {
  testShouldConvertArr(actions.RESET_ERROR_STATE, actions.resetErrorState);
});

test('resetAllState should reset state', () => {
  const expectedResult: FSA = {
    type: actions.RESET_ALL_STATE,
    payload: null,
  };
  const resultOfAction: FSA = actions.resetAllState();
  expect(resultOfAction).toEqual(expectedResult);
});
