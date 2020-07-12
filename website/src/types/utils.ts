// Various utility types and type utilities for making working with TypeScript
// easier

export type Subtract<T extends K, K> = Omit<T, keyof K>;

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

/**
 * Returns the types of the value of T
 */
export type Values<T extends {}> = T[keyof T];

export const EMPTY_ARRAY: readonly unknown[] = [];

export const notNull = <T>(x: T | null | undefined): x is T => x !== null;

// TypeScript by default only allows string in parseFloat, even though this works fine
export const parseFloat = (float: number | string): number =>
  typeof float === 'string' ? window.parseFloat(float) : float;

/**
 * Used to assert that a value is never, usually used to verify that all values of a
 * union has been checked in a switch or series of if statements, eg.
 *
 * Do not use if the value can actually be something else, but we want our typing
 * to be tighter, such as with values from the user, since this will throw an error and
 * crash if called at run time. Use verifyNever instead in those cases.
 */
export function assertNever(value: never): never {
  throw new Error(`Should be unreachable, unexpected value: ${JSON.stringify(value)}`);
}

/**
 * Typechecking helper that asserts a value cannot be reached. Same idea as
 * assertNever, but does not throw in case you want to do something else like
 * log instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function verifyNever(_value: never) {
  // Body left intentionally empty
}
