export const captureException = jest.fn();
export const getScriptErrorHandler = jest.fn().mockReturnValue(() => jest.fn());
export const retryImport = jest.fn().mockResolvedValue(undefined);
