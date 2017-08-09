import parseString, {
  cleanOperators,
} from './parseString';

describe('cleanOperators', () => {
  const andToken = { image: 'and' };
  const orToken = { image: 'or' };
  const moduleToken = { image: 'CS1000' };

  const leftBracketToken = { image: '(' };
  const rightBracketToken = { image: ')' };

  it('cleans excess operators from simple strings', () => {
    const tokens = [
      andToken,
      moduleToken,
      orToken,
      andToken,
    ];
    expect(cleanOperators(tokens)).toEqual([moduleToken]);
  });

  it('cleans excess operators within parenthesis', () => {
    const tokens = [
      leftBracketToken,
      andToken,
      moduleToken,
      orToken,
      rightBracketToken,
    ];
    expect(cleanOperators(tokens)).toEqual([leftBracketToken, moduleToken, rightBracketToken]);
  });

  it('cleans excess operators outside and within parenthesis', () => {
    const tokens = [
      orToken,
      leftBracketToken,
      andToken,
      moduleToken,
      orToken,
      rightBracketToken,
      andToken,
    ];
    expect(cleanOperators(tokens)).toEqual([leftBracketToken, moduleToken, rightBracketToken]);
  });

  it('cleans excess operators within nested parenthesis', () => {
    const tokens = [
      leftBracketToken,
      orToken,
      leftBracketToken,
      andToken,
      moduleToken,
      orToken,
      rightBracketToken,
      andToken,
      rightBracketToken,
    ];
    expect(cleanOperators(tokens)).toEqual([
      leftBracketToken,
      leftBracketToken,
      moduleToken,
      rightBracketToken,
      rightBracketToken,
    ]);
  });

  it('cleans excess operators within nested parenthesis', () => {
    const tokens = [
      leftBracketToken,
      leftBracketToken,
      andToken,
      moduleToken,
      orToken,
      rightBracketToken,
      rightBracketToken,
    ];
    expect(cleanOperators(tokens)).toEqual([
      leftBracketToken,
      leftBracketToken,
      moduleToken,
      rightBracketToken,
      rightBracketToken,
    ]);
  });

  it('does not throw with empty parenthesis', () => {
    const tokens = [
      leftBracketToken,
      rightBracketToken,
    ];
    expect(cleanOperators(tokens)).toEqual([]);
  });
});

describe('parseString', () => {
  it('parses single module to a leaf', () => {
    expect(parseString('CS1000')).toEqual('CS1000');
  });

  it('parses simple strings in `or` form', () => {
    expect(parseString('CS1000 or CS1001')).toEqual({
      or: [
        'CS1000',
        'CS1001',
      ],
    });
  });

  it('parses simple strings in `and` form', () => {
    expect(parseString('CS1000 and CS1001')).toEqual({
      and: [
        'CS1000',
        'CS1001',
      ],
    });
  });

  it('parses left to right order for `CS1000 and CS1001 or CS1002`', () => {
    const result = {
      and: [
        'CS1000',
        {
          or: [
            'CS1001',
            'CS1002',
          ],
        },
      ],
    };
    expect(parseString('CS1000 and CS1001 or CS1002')).toEqual(result);
  });

  it('parses left to right order for `CS1000 or CS1001 and CS1002`', () => {
    const result = {
      and: [
        {
          or: [
            'CS1000',
            'CS1001',
          ],
        },
        'CS1002',
      ],
    };
    expect(parseString('CS1000 or CS1001 and CS1002')).toEqual(result);
  });

  it('parses left to right order for very complex queries multiple(`or` `and`)', () => {
    const result = {
      and: [
        {
          or: [
            'CS1000',
            'CS1001',
          ],
        },
        {
          or: [
            'CS1002',
            'CS1003',
          ],
        },
      ],
    };
    expect(parseString('CS1000 or CS1001 and CS1002 or CS1003')).toEqual(result);
  });

  it('parses strings with excess `or` operator', () => {
    expect(parseString('or CS1000')).toEqual('CS1000');
    expect(parseString('CS1000 or')).toEqual('CS1000');
  });

  it('parses strings with excess `and` operator', () => {
    expect(parseString('and CS1000')).toEqual('CS1000');
    expect(parseString('CS1000 and')).toEqual('CS1000');
    expect(parseString('(CS1000 and)')).toEqual('CS1000');
  });

  it('parses strings with duplicate `and` operator', () => {
    expect(parseString('CS1000 and and CS1001')).toEqual({
      and: [
        'CS1000',
        'CS1001',
      ],
    });
  });

  it('parses strings with duplicate `or` operator', () => {
    expect(parseString('CS1000 or or CS1001')).toEqual({
      or: [
        'CS1000',
        'CS1001',
      ],
    });
  });

  it('parses strings with parenthesis that have no modules in between', () => {
    expect(parseString('CS1000 ()')).toEqual('CS1000');
  });

  it('parses strings with operators that have no modules in between', () => {
    expect(parseString('CS1000 or and CS1001')).toEqual({
      and: [
        'CS1000',
        'CS1001',
      ],
    });
  });
});
