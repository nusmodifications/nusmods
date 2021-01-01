export class HttpError extends Error {
  code: number;
  originalError: Error | undefined;
  constructor(code: number, message: string, originalError?: Error) {
    super(message);
    this.code = code;
    this.originalError = originalError;
  }
}
