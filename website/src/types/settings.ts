export type ThemeId = string;

export type Theme = {
  readonly id: ThemeId;
  readonly name: string;
};

export type Mode = 'DEFAULT' | 'LIGHT' | 'DARK';

export const DEFAULT_MODE: Mode = 'DEFAULT';
export const LIGHT_MODE: Mode = 'LIGHT';
export const DARK_MODE: Mode = 'DARK';
