import { ModuleCode } from 'types/modules';
import moduleList from '__mocks__/modules';

import { sortModules } from './moduleSearch';

describe('sortModules', () => {
  function testSortModule(term: string, ...results: ModuleCode[]) {
    const sorted = sortModules(term, moduleList).map((m) => m.moduleCode);
    expect(sorted.slice(0, results.length)).toEqual(results);
  }

  test('sorts by preferring module prefix', () => {
    testSortModule('cs', 'CS1010S', 'CS3216');
  });

  test('sorts by preferring module code', () => {
    testSortModule('10', 'BFS1001', 'CS1010S', 'GES1021');
  });

  test('sorts by preferring title second', () => {
    testSortModule('managerial', 'ACC2002');
  });
});
