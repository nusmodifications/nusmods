/* eslint-disable import/prefer-default-export */

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>; // Remove types from T that are assignable to U
