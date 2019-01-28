// Custom version of assert libdef since Flow master doesn't have this yet

declare module "assert" {
  declare class AssertionError extends Error {}

  declare type AssertStrict = {
    (value: any, message?: string): void;
    ok(value: any, message?: string): void;
    fail(actual: any, expected: any, message: string, operator: string): void;
    equal(actual: any, expected: any, message?: string): void;
    notEqual(actual: any, expected: any, message?: string): void;
    deepEqual(actual: any, expected: any, message?: string): void;
    notDeepEqual(actual: any, expected: any, message?: string): void;
    throws(
      block: Function,
      error?: Function | RegExp | (err: any) => boolean,
      message?: string
    ): void;
    doesNotThrow(block: Function, message?: string): void;
    ifError(value: any): void;
    AssertionError: typeof AssertionError;
  };

  declare module.exports: {
    (value: any, message?: string): void;
    ok(value: any, message?: string): void;
    fail(actual: any, expected: any, message: string, operator: string): void;
    equal(actual: any, expected: any, message?: string): void;
    notEqual(actual: any, expected: any, message?: string): void;
    deepEqual(actual: any, expected: any, message?: string): void;
    notDeepEqual(actual: any, expected: any, message?: string): void;
    strictEqual(actual: any, expected: any, message?: string): void;
    notStrictEqual(actual: any, expected: any, message?: string): void;
    deepStrictEqual(actual: any, expected: any, message?: string): void;
    notDeepStrictEqual(actual: any, expected: any, message?: string): void;
    throws(
      block: Function,
      error?: Function | RegExp | (err: any) => boolean,
      message?: string
    ): void;
    doesNotThrow(block: Function, message?: string): void;
    ifError(value: any): void;
    AssertionError: typeof AssertionError;
    strict: AssertStrict;
  }
}
