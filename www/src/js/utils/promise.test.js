// @flow
import { retry } from './promise';

describe('#retry()', () => {
  test('should retry up till limit if shouldRetry returns true', () => {
    expect.assertions(2);
    const mockFailingFn = jest.fn().mockReturnValue(Promise.reject('error'));
    return retry(3, mockFailingFn, () => true).catch((error) => {
      expect(error).toBe('error');
      expect(mockFailingFn.mock.calls).toHaveLength(4);
    });
  });

  test('should not retry if shouldRetry returns false', () => {
    expect.assertions(2);
    const mockFailingFn = jest.fn().mockReturnValue(Promise.reject('error'));

    // Retry once
    const shouldRetry = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValue(false);

    return retry(3, mockFailingFn, shouldRetry).catch((error) => {
      expect(error).toBe('error');
      expect(mockFailingFn.mock.calls).toHaveLength(2);
    });
  });

  test('should not retry if promise returns true', () => {
    expect.assertions(1);
    // Fail only once
    const mockFailingFn = jest
      .fn()
      .mockReturnValueOnce(Promise.reject('error'))
      .mockReturnValue(Promise.resolve());

    return retry(3, mockFailingFn, () => true).then(() => {
      expect(mockFailingFn.mock.calls).toHaveLength(2);
    });
  });

  test('should not retry successful promises', () => {
    expect.assertions(1);
    const mockSucceedingFn = jest.fn().mockReturnValue(Promise.resolve());
    return retry(3, mockSucceedingFn, () => true).then(() => {
      expect(mockSucceedingFn.mock.calls).toHaveLength(1);
    });
  });
});
