// @flow
import type { FSA } from 'types/redux';

import * as actions from 'actions/moduleBank';

test('fetchModuleList should return a request action', () => {
  const resultOfAction: FSA = actions.fetchModuleList();
  expect(resultOfAction).toMatchSnapshot();
});

test('fetchModule should return a request action', () => {
  const resultOfAction: FSA = actions.fetchModule('CS1010S');
  expect(resultOfAction).toMatchSnapshot();
});

test('loadModule should dispatch a request if module is not found', () => {
  const dispatch = jest.fn();
  const getState = () => {
    return {
      entities: {
        moduleBank: {
          modules: {},
        },
      },
    };
  };
  actions.loadModule('test')(dispatch, getState);
  expect(dispatch.mock.calls[0][0]).toMatchSnapshot();
});

test('loadModule should resolve immediately if module is found', () => {
  const dispatch = jest.fn();
  const getState = () => {
    return {
      entities: {
        moduleBank: {
          modules: {
            test: {},
          },
        },
      },
    };
  };
  actions.loadModule('test')(dispatch, getState);
  expect(dispatch).not.toHaveBeenCalled();
});
