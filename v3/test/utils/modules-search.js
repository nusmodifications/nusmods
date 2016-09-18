import test from 'ava';
import JsSearch from 'js-search';
import { ModulesSearchIndex, ModulesTokenizer } from 'utils/modules-search';

const one = { value: 'CS1101S', label: 'CS1101S Programming Methodology' };
const two = { value: 'CS1010', label: 'CS1010 Programming Methodology' };
const three = { value: 'CS2020', label: 'CS2020 Algorithms and Data Structures' };
const four = { value: 'CA1004', label: 'GEH1004 Chinese Heritage: Hist & Lit' };

function initSearch() {
  const search = new JsSearch.Search('label');
  search.searchIndex = new ModulesSearchIndex();
  search.addIndex('value');
  search.addDocuments([one, two, three, four]);
  return search;
}

test('search should find out correct query', (t) => {
  const search = initSearch();

  const query = 'CS1010';
  const expected = [two];
  t.deepEqual(search.search(query), expected);
});

test('search index lexicographically first by alphnumerics then by numbers', (t) => {
  const search = initSearch();

  const query = 'C';
  const expected = [two, one, three, four];
  t.deepEqual(search.search(query), expected);
});

test('tokenize should split a string to array of tokens', (t) => {
  const tokenizer = new ModulesTokenizer();
  const text = 'test 1 2 3';
  const expected = ['test', '1', '2', '3'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});

test('tokenize should create a new token without the prefix', (t) => {
  const tokenizer = new ModulesTokenizer();
  const text = 'CS1101S 1 2 3  ';
  const expected = ['1101S', 'CS1101S', '1', '2', '3'];
  t.deepEqual(tokenizer.tokenize(text), expected);
});
