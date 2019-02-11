import parseString, { cleanOperators } from './parseString';
import { mockLogger } from '../../utils/test-utils';

const logger = mockLogger();

describe(cleanOperators, () => {
  const and: any = { image: 'and' };
  const or: any = { image: 'or' };
  const module: any = { image: 'CS1000' };

  const leftParen: any = { image: '(' };
  const rightParen: any = { image: ')' };

  it('cleans excess operators from simple strings', () => {
    const tokens = [and, module, or, and];
    expect(cleanOperators(tokens)).toEqual([module]);
  });

  it('cleans excess operators within parenthesis', () => {
    const tokens = [leftParen, and, module, or, rightParen];
    expect(cleanOperators(tokens)).toEqual([leftParen, module, rightParen]);
  });

  it('cleans excess operators outside and within parenthesis', () => {
    const tokens = [or, leftParen, and, module, or, rightParen, and];
    expect(cleanOperators(tokens)).toEqual([leftParen, module, rightParen]);
  });

  it('cleans excess operators within nested parenthesis', () => {
    const tokens = [leftParen, or, leftParen, and, module, or, rightParen, and, rightParen];
    expect(cleanOperators(tokens)).toEqual([leftParen, leftParen, module, rightParen, rightParen]);
  });

  it('cleans excess operators within nested parenthesis', () => {
    const tokens = [leftParen, leftParen, and, module, or, rightParen, rightParen];
    expect(cleanOperators(tokens)).toEqual([leftParen, leftParen, module, rightParen, rightParen]);
  });

  it('inserts necessary operators when missing', () => {
    const tokens = [leftParen, module, or, module, module, rightParen];
    expect(cleanOperators(tokens)).toEqual([leftParen, module, or, module, or, module, rightParen]);
  });

  it('does not throw with empty parenthesis', () => {
    const tokens = [leftParen, rightParen];
    expect(cleanOperators(tokens)).toEqual([]);
  });
});

describe(parseString, () => {
  const parse = (string: string) => parseString(string, logger);

  it('parses single module to a leaf', () => {
    expect(parse('CS1000')).toEqual('CS1000');
  });

  it('parses simple strings in `or` form', () => {
    expect(parse('CS1000 or CS1001')).toEqual({
      or: ['CS1000', 'CS1001'],
    });
  });

  it('parses simple strings in `and` form', () => {
    expect(parse('CS1000 and CS1001')).toEqual({
      and: ['CS1000', 'CS1001'],
    });
  });

  it('parses left to right order for `CS1000 and CS1001 or CS1002`', () => {
    const result = {
      and: [
        'CS1000',
        {
          or: ['CS1001', 'CS1002'],
        },
      ],
    };
    expect(parse('CS1000 and CS1001 or CS1002')).toEqual(result);
  });

  it('parses left to right order for `CS1000 or CS1001 and CS1002`', () => {
    const result = {
      and: [
        {
          or: ['CS1000', 'CS1001'],
        },
        'CS1002',
      ],
    };
    expect(parse('CS1000 or CS1001 and CS1002')).toEqual(result);
  });

  it('parses left to right order for very complex queries multiple(`or` `and`)', () => {
    const result = {
      and: [
        {
          or: ['CS1000', 'CS1001'],
        },
        {
          or: ['CS1002', 'CS1003'],
        },
      ],
    };
    expect(parse('CS1000 or CS1001 and CS1002 or CS1003')).toEqual(result);
  });

  it('parses strings with excess `or` operator', () => {
    expect(parse('or CS1000')).toEqual('CS1000');
    expect(parse('CS1000 or')).toEqual('CS1000');
  });

  it('parses strings with excess `and` operator', () => {
    expect(parse('and CS1000')).toEqual('CS1000');
    expect(parse('CS1000 and')).toEqual('CS1000');
    expect(parse('(CS1000 and)')).toEqual('CS1000');
  });

  it('parses strings with duplicate `and` operator', () => {
    expect(parse('CS1000 and and CS1001')).toEqual({
      and: ['CS1000', 'CS1001'],
    });
  });

  it('parses strings with duplicate `or` operator', () => {
    expect(parse('CS1000 or or CS1001')).toEqual({
      or: ['CS1000', 'CS1001'],
    });
  });

  it('parses strings with parenthesis that have no modules in between', () => {
    expect(parse('CS1000 ()')).toEqual('CS1000');
  });

  it('parses strings with operators that have no modules in between', () => {
    expect(parse('CS1000 or and CS1001')).toEqual({
      and: ['CS1000', 'CS1001'],
    });
  });

  it('parses strings with modules with no operators in between', () => {
    expect(parse('(ES1231 or ESP2107 ST1232) and (MA1102R or MA1505)')).toEqual({
      and: [{ or: ['ES1231', 'ESP2107', 'ST1232'] }, { or: ['MA1102R', 'MA1505'] }],
    });
  });

  it('parses strings with modules with no operators in between', () => {
    expect(parse('(ES1231 and ESP2107 ST1232) or (MA1102R and MA1505)')).toEqual({
      or: [{ and: ['ES1231', 'ESP2107', 'ST1232'] }, { and: ['MA1102R', 'MA1505'] }],
    });
  });
});
