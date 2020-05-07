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
