export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export const notFalsy = (Boolean as any) as <T>(x: T | false) => x is T;
export const notNull = <T>(x: T | null | undefined): x is T => x != null;

export const parseFloat = (float: number | string): number =>
  typeof float === 'string' ? parseFloat(float) : float;
