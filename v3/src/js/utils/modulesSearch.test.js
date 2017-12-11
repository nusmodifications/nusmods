// @flow

import { Search } from 'js-search';
import { ModulesSearchIndex, ModulesTokenizer } from 'utils/modulesSearch';
import type { SelectOption } from 'types/views';

const one: SelectOption = { value: 'CS1101S', label: 'CS1101S Programming Methodology' };
const two: SelectOption = { value: 'CS1010', label: 'CS1010 Programming Methodology' };
const three: SelectOption = { value: 'CS2020', label: 'CS2020 Algorithms and Data Structures' };
const four: SelectOption = { value: 'CA1004', label: 'GEH1004 Chinese Heritage: Hist & Lit' };

function initSearch() {
  const search = new Search('label');
  search.searchIndex = new ModulesSearchIndex();
  search.addIndex('value');
  search.addDocuments([one, two, three, four]);
  return search;
}

test('search should find out correct query', () => {
  const search = initSearch();

  const query: string = 'CS1010';
  const expected: Array<SelectOption> = [two];
  expect(search.search(query)).toEqual(expected);
});

test('search index lexicographically first by alphnumerics then by numbers', () => {
  const search = initSearch();

  const query: string = 'C';
  const expected: Array<SelectOption> = [two, one, three, four];
  expect(search.search(query)).toEqual(expected);
});

test('tokenize should split a string to array of tokens', () => {
  const tokenizer = new ModulesTokenizer();
  const text: string = 'test 1 2 3';
  const expected: Array<string> = ['test', '1', '2', '3'];
  expect(tokenizer.tokenize(text)).toEqual(expected);
});

test('tokenize should create a new token without the prefix', () => {
  const tokenizer = new ModulesTokenizer();
  const text: string = 'CS1101S 1 2 3  ';
  const expected: Array<string> = ['1101S', 'CS1101S', '1', '2', '3'];
  expect(tokenizer.tokenize(text)).toEqual(expected);
});
