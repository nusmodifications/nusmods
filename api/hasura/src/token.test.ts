import tokenGenerator from './token';

jest.mock('./config');

describe('getMailToken', () => {
  it('should generate token', () => {
    const token = tokenGenerator.getMailToken();
    expect(typeof token).toBe('string');
  });
});
