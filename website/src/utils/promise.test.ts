import { retry } from './promise';

describe('#retry()', () => {
  const error = new Error('test error');

  test('should retry failing fn up till limit if shouldRetry returns true', async () => {
    const mockFailingFn = vi.fn().mockReturnValue(Promise.reject(error));
    await expect(retry(3, mockFailingFn, () => true)).rejects.toThrow(error);
    expect(mockFailingFn).toHaveBeenCalledTimes(4);
  });

  test('should stop retrying if shouldRetry returns false', async () => {
    const mockFailingFn = vi.fn().mockReturnValue(Promise.reject(error));

    // Retry once
    const shouldRetry = vi.fn().mockReturnValueOnce(true).mockReturnValue(false);

    await expect(retry(3, mockFailingFn, shouldRetry)).rejects.toThrow(error);
    expect(mockFailingFn).toHaveBeenCalledTimes(2);
  });

  test('should stop retrying if promise resolves', async () => {
    // Fail only once
    const mockFailingFn = vi
      .fn()
      .mockReturnValueOnce(Promise.reject(error))
      .mockReturnValue(Promise.resolve());

    await expect(retry(3, mockFailingFn, () => true)).resolves;
    expect(mockFailingFn).toHaveBeenCalledTimes(2);
  });

  test('should not retry successful promises', async () => {
    const mockSucceedingFn = vi.fn().mockReturnValue(Promise.resolve());
    await expect(retry(3, mockSucceedingFn, () => true)).resolves;
    expect(mockSucceedingFn).toHaveBeenCalledTimes(1);
  });
});
