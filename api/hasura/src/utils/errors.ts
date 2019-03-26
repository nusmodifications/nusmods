import { JsonWebTokenError } from 'jsonwebtoken';
export { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export class InvalidTokenError extends JsonWebTokenError {
  public constructor(message: string = 'Invalid token') {
    super(message);
    Error.captureStackTrace(this, InvalidTokenError);
    this.name = this.constructor.name;
  }
}

export class RateLimitError extends Error {
  public constructor(message: string = 'Rate limit exceeded, please try again later.') {
    super(message);
    Error.captureStackTrace(this, RateLimitError);
    this.name = this.constructor.name;
  }
}
