import { normalize } from './normalizeString';

/* eslint-disable max-len */
describe('normalizeString', () => {
  it('converts commas to delimiter or', () => {
    const testString = 'ACC1002 Financial Accounting, BSP1004 Legal Environment of Business, FIN2004 Finance';
    const expected = 'ACC1002 Financial Accounting or  BSP1004 Legal Environment of Business or  FIN2004 Finance';
    expect(normalize(testString)).toBe(expected);
  });

  it('converts commas to delimiter and when written like a sentence', () => {
    const testString = 'ACC1002 Financial Accounting, BSP1004 Legal Environment of Business, and FIN2004 Finance';
    const expected = 'ACC1002 Financial Accounting and  BSP1004 Legal Environment of Business and  FIN2004 Finance';
    expect(normalize(testString)).toBe(expected);
  });

  it('splits conjoined operators', () => {
    const testString = 'MA1505and MA1506';
    const expected = 'MA1505 and MA1506';
    expect(normalize(testString)).toBe(expected);
  });

  it('splits / module codes into respective modules', () => {
    const testString = 'CS2103/T';
    const expected = 'CS2103 or CS2103T';
    expect(normalize(testString)).toBe(expected);
  });

  it('removes module titles that contains operators 1', () => {
    const testString = 'ACC3616 Corporate Governance and Risk Management or ACC3612 Risk Management and Internal Control';
    const expected = 'ACC3616 Corporate  Management or ACC3612 Risk  Control';
    expect(normalize(testString)).toBe(expected);
  });

  it('removes module titles that contains operators 2', () => {
    const testString = '(Undergraduate physics and mathematics AND Electronics materials courses)';
    const expected = '( materials courses)';
    expect(normalize(testString)).toBe(expected);
  });

  it('replaces synonyms', () => {
    const testString = '[(CM1121 or CM1501) plus (LSM1101 or LSM1401 or MLE1101)] or MLE3104';
    const expected = '((CM1121 or CM1501) and (LSM1101 or LSM1401 or MLE1101)) or MLE3104';
    expect(normalize(testString)).toBe(expected);
  });

  it('lowercases operators', () => {
    const testString = '(1) Either BSP1005 or EC1301 AND (2) Either DSC2008 or EC2303';
    const expected = '(1) Either BSP1005 or EC1301 and (2) Either DSC2008 or EC2303';
    expect(normalize(testString)).toBe(expected);
  });

  it('changes roman numerals to digits', () => {
    const testString = '(i) CS1000 (ii) CS1001';
    const testString1 = 'i) CS1000 ii) CS1001';
    const expected = '(1) CS1000 (2) CS1001';
    expect(normalize(testString)).toBe(expected);
    expect(normalize(testString1)).toBe(expected);
  });

  it('changes alphabets to digits', () => {
    const testString = '(a) CS1000 (b) CS1001';
    const testString1 = 'a) CS1000 b) CS1001';
    const expected = '(1) CS1000 (2) CS1001';
    expect(normalize(testString)).toBe(expected);
    expect(normalize(testString1)).toBe(expected);
    expect(normalize('a) CS1000 or b) CS1001')).toBe('(1) CS1000 or (2) CS1001');
  });

  it('does not change modules or operators to digits', () => {
    const testString = '(CS1000)';
    expect(normalize(testString)).toBe(testString);
    const testString1 = 'CS1000)';
    expect(normalize(testString1)).toBe(testString1);
    const testString2 = '(or)';
    expect(normalize(testString2)).toBe(testString2);
  });

  it('fixes listing brackets', () => {
    const testString = '1) CS1000 2) CS1001';
    const expected = '(1) CS1000 (2) CS1001';
    expect(normalize(testString)).toBe(expected);
  });

  it('changes listing into brackets given that an operator exists', () => {
    const testString = '1) CS1000 or 2) CS1001';
    const expected = '(1) CS1000 or (2) CS1001';
    expect(normalize(testString)).toBe(expected);
  });
});
