// @flow
import { mapActionsToReducers } from './sync-middleware';

describe('#mapActionsToReducers', () => {
  test('should map action types to reducer names', () => {
    const config = {
      reducer1: { actions: ['ACTION1', 'ACTION2'] },
      reducer2: { actions: ['ACTION3', 'ACTION4', 'ACTION5'] },
      reducer3: { actions: ['ACTION1'] }, // Second reducer overrides
    };
    expect(mapActionsToReducers(config)).toEqual({
      ACTION1: 'reducer3',
      ACTION2: 'reducer1',
      ACTION3: 'reducer2',
      ACTION4: 'reducer2',
      ACTION5: 'reducer2',
    });
  });
});
