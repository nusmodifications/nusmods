import { appendCustomIdentifier, removeCustomIdentifier, cretaeCustomModule } from './custom';

test('appendCustomIdentifier should return the proper custom module code', () => {
  expect(appendCustomIdentifier('CS2030')).toEqual('custom=CS2030');
  expect(appendCustomIdentifier('custom=CS2030')).toEqual('custom=custom=CS2030');
  expect(appendCustomIdentifier('')).toEqual('custom=');
});

test('removeCustomIdentifier should return the proper module code', () => {
  expect(removeCustomIdentifier('custom=CS2030')).toEqual('CS2030');
  expect(removeCustomIdentifier('custom=custom=CS2030')).toEqual('custom=CS2030');
  expect(removeCustomIdentifier('abc')).toEqual('abc');
});

test('cretaeCustomModule should return the proper custom module', () => {
  const actual = cretaeCustomModule('CS1101S', 'Programming Methodology');
  const expected = {
    moduleCode: 'CS1101S',
    title: 'Programming Methodology',
    isCustom: true,
    acadYear: '',
    moduleCredit: '0',
    department: '',
    faculty: '',
    semesterData: [],
    timestamp: 0,
  };

  expect(expected).toEqual(actual);
});
