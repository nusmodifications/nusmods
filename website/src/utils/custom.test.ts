import { CustomModuleLessonData } from 'types/reducers';
import {
  appendCustomIdentifier,
  removeCustomIdentifier,
  createCustomModule,
  serializeCustomModuleList,
} from './custom';

test('appendCustomIdentifier should return the proper custom module code', () => {
  expect(appendCustomIdentifier('CS2030')).toEqual('CUSTOMCS2030');
  expect(appendCustomIdentifier('CUSTOMCS2030')).toEqual('CUSTOMCUSTOMCS2030');
  expect(appendCustomIdentifier('')).toEqual('CUSTOM');
});

test('removeCustomIdentifier should return the proper module code', () => {
  expect(removeCustomIdentifier('CUSTOMCS2030')).toEqual('CS2030');
  expect(removeCustomIdentifier('CUSTOMCUSTOMCS2030')).toEqual('CUSTOMCS2030');
  expect(removeCustomIdentifier('abc')).toThrowError();
});

test('createCustomModule should return the proper custom module', () => {
  const actual = createCustomModule('CS1101S', 'Programming Methodology');
  const expected = {
    moduleCode: 'CUSTOMCS1101S',
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
