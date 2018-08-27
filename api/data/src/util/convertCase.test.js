import convertCase from './convertCase';

const { snakeCase, camelCase } = convertCase;

describe('snakeCase', () => {
  it('should snakeCase identifiers', () => {
    expect(snakeCase('someKey')).toBe('some_key');
  });
});

describe('camelCase', () => {
  it('should camelCase strings', () => {
    expect(camelCase('some_key')).toBe('someKey');
  });
  const snakeCaseObj = {
    key_one: 1,
    key_two: ['some text'],
  };
  const camelCaseObj = {
    keyOne: 1,
    keyTwo: ['some text'],
  };
  it('should camelCase object', () => {
    expect(camelCase(snakeCaseObj)).toEqual(camelCaseObj);
  });
  it('should camelCase arrays of objects', () => {
    expect(camelCase([snakeCaseObj, snakeCaseObj])).toEqual([camelCaseObj, camelCaseObj]);
  });
});
