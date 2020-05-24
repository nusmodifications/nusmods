// Various utility types and type utilities for making working with TypeScript
// easier

/**
 * Remove from T the subset K
 */
export type Subtract<T extends K, K> = Omit<T, keyof K>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any;

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends AnyFunction ? K : never;
}[keyof T];

/**
 * We still need the {} type for things like components that take no props,
 * which is safe since JSX adds intrinsic attributes. This just gets around
 * the ESLint ban in a more readable fashion while still ensuring functions
 * don't use this type (since it is named Props)
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type EmptyProps = {};

/**
 * Returns the types of the value of T
 */
export type Values<T extends Record<string, unknown>> = T[keyof T];

export const EMPTY_ARRAY: readonly unknown[] = [];

export const notNull = <T>(x: T | null | undefined): x is T => x != null;

// TypeScript by default only allows string in parseFloat, even though this works fine
export const parseFloat = (float: number | string): number =>
  typeof float === 'string' ? window.parseFloat(float) : float;
