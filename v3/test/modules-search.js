import { expect } from 'chai';
import JsSearch from 'js-search';
import { ModulesSearchIndex, ModulesTokenizer } from '../src/js/utils/modules-search';

describe('modules-search/ModulesSearchIndex', () => {
  const search = new JsSearch.Search('label');
  search.searchIndex = new ModulesSearchIndex();
  search.addIndex('value');

  const one = { value: 'CS1101S', label: 'CS1101S Programming Methodology' };
  const two = { value: 'CS1010', label: 'CS1010 Programming Methodology' };
  const three = { value: 'CS2020', label: 'CS2020 Algorithms and Data Structures' };

  search.addDocuments([one, two, three]);
  it('search should find out correct query', () => {
    const query = 'CS1010';
    const expectedResult = [two];
    expect(search.search(query)).to.deep.equal(expectedResult);
  });

  it('search should index alphanumerically', () => {
    const query = 'CS1';
    const expectedResult = [two, one];
    expect(search.search(query)).to.deep.equal(expectedResult);
  });
});

describe('modules-search/ModulesTokenizer', () => {
  it('tokenize should split a string to array of tokens', () => {
    const tokenizer = new ModulesTokenizer();
    const text = 'test 1 2 3';
  	const expectedResult = ['test', '1' , '2', '3'];
    expect(tokenizer.tokenize(text)).to.deep.equal(expectedResult);
  });

  it('tokenize should create a new token without the prefix', () => {
    const tokenizer = new ModulesTokenizer();
    const text = 'CS1101S 1 2 3  ';
    const expectedResult = ['1101S', 'CS1101S', '1' , '2', '3'];
    expect(tokenizer.tokenize(text)).to.deep.equal(expectedResult);
  });
});
