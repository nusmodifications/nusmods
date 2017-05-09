// @flow
import type { FSA } from 'types/redux';

import test from 'ava';
import * as actions from 'actions/helpers';

function testShouldReturnArr(t, type, action): void {
  const payload: Array<any> = [];
  const expectedResult: FSA = {
    type,
    payload,
  };
  const resultOfAction: FSA = action(payload);
  t.deepEqual(resultOfAction, expectedResult);
}

test('resetRequestState should return an array', (t) => {
  testShouldReturnArr(t, actions.RESET_REQUEST_STATE, actions.resetRequestState);
});

test('resetErrorState should return an array', (t) => {
  testShouldReturnArr(t, actions.RESET_ERROR_STATE, actions.resetErrorState);
});

function testShouldConvertArr(t, type, action): void {
  const payload: string = 'test';
  const expectedResult: FSA = {
    type,
    payload: [payload],
  };
  const resultOfAction: FSA = action(payload);
  t.deepEqual(resultOfAction, expectedResult);
}

test('resetRequestState should convert item to an array', (t) => {
  testShouldConvertArr(t, actions.RESET_REQUEST_STATE, actions.resetRequestState);
});

test('resetErrorState should convert item to an array', (t) => {
  testShouldConvertArr(t, actions.RESET_ERROR_STATE, actions.resetErrorState);
});

test('resetAllState should reset state', (t) => {
  const expectedResult: FSA = {
    type: actions.RESET_ALL_STATE,
    payload: null,
  };
  const resultOfAction: FSA = actions.resetAllState();
  t.deepEqual(resultOfAction, expectedResult);
});
