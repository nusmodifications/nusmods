import convertCase from './convertCase';
import { COLUMNS } from './constants';

const { snakeCase, camelCase } = convertCase;
const createdAt = 'createdAt';
const updatedAt = 'updatedAt';

describe('snakeCase', () => {
  it('should snakeCase known identifiers', () => {
    expect(snakeCase(createdAt)).toBe(COLUMNS[createdAt]);
  });
  it('should not snakeCase unknown identifiers', () => {
    expect(snakeCase('unknownId')).toBe('unknownId');
  });
});

describe('camelCase', () => {
  it('should camelCase known identifiers', () => {
    expect(camelCase(COLUMNS.createdAt)).toBe(createdAt);
  });
  it('should not camelCase unknown identifiers', () => {
    expect(camelCase('unknown_id')).toBe('unknown_id');
  });
  const snakeCaseObj = {
    [COLUMNS.createdAt]: 1,
    [COLUMNS.updatedAt]: ['some text'],
  };
  const camelCaseObj = {
    [createdAt]: 1,
    [updatedAt]: ['some text'],
  };
  it('should camelCase object', () => {
    expect(camelCase(snakeCaseObj)).toEqual(camelCaseObj);
  });
  it('should camelCase arrays of objects', () => {
    expect(camelCase([snakeCaseObj, snakeCaseObj])).toEqual([camelCaseObj, camelCaseObj]);
  });
});
