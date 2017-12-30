// @flow
import type { ModuleBank } from 'reducers/moduleBank';
import { setModules } from 'actions/export';
import CS1010S from '__mocks__/modules/CS1010S.json';
import CS3216 from '__mocks__/modules/CS3216.json';
import GES1021 from '__mocks__/modules/GES1021.json';
import reducer from './moduleBank';

const initialState: ModuleBank = {
  modules: {},
  moduleList: [],
  moduleCodes: {},
  apiLastUpdatedTimestamp: null,
};

test('setModules to update module bank', () => {
  let state = reducer(initialState, setModules([CS1010S, CS3216]));
  expect(state.modules).toEqual({ CS1010S, CS3216 });

  state = reducer(state, setModules([GES1021]));
  expect(state.modules).toEqual({ GES1021 });
});
