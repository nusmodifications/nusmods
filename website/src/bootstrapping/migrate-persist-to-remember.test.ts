import { mapValues, omit } from 'lodash';
import storage from 'storage';

test('redux-persist JSON members should be parsed and _persist should be removed', () => {
  const mockData = {
    maps: {},
    arrays: [],
    number: 0,
    string: '',
    _persist: true,
  };

  const mockDataWithStringifiedMembers = mapValues(mockData, JSON.stringify);

  storage.setItem('persist:test_key', mockDataWithStringifiedMembers);

  const recoveredData = storage.getItem('@@remember-test_key');
  expect(recoveredData).toStrictEqual(omit(mockData, '_persist'));
});
