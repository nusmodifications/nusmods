import test from 'ava';
import * as actions from 'actions/helpers';

function testShouldReturnArr(t, type, action) {
  const payload = [];
  const expectedResult = {
    type,
    payload: payload,
  };
  const resultOfAction = action(payload);
  t.deepEqual(resultOfAction, expectedResult);
}

function testShouldConvertArr(t, type, action) {
  const payload = 'test';
  const expectedResult = {
    type,
    payload: [payload],
  };
  const resultOfAction = action(payload);
  t.deepEqual(resultOfAction, expectedResult);
}

test('resetRequestState should convert item to an array', (t) => {
  testShouldReturnArr(t, actions.RESET_REQUEST_STATE, actions.resetRequestState);
});

test('resetErrorState should convert item to an array', (t) => {
  testShouldReturnArr(t, actions.RESET_ERROR_STATE, actions.resetErrorState);
});


test('resetRequestState should convert item to an array', (t) => {
  testShouldConvertArr(t, actions.RESET_REQUEST_STATE, actions.resetRequestState);
});

test('resetErrorState should convert item to an array', (t) => {
  testShouldConvertArr(t, actions.RESET_ERROR_STATE, actions.resetErrorState);
});


test('resetAllState should reset state', (t) => {
  const expectedResult = {
    type: actions.RESET_ALL_STATE,
  };
  const resultOfAction = actions.resetAllState();
  t.deepEqual(resultOfAction, expectedResult);
});
