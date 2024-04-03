export type ThemeId = string;

export type Theme = {
  readonly id: ThemeId;
  readonly name: string;
};

export type Mode = 'SYSTEM' | 'LIGHT' | 'DARK';

export const SYSTEM_MODE: Mode = 'SYSTEM';
export const LIGHT_MODE: Mode = 'LIGHT';
export const DARK_MODE: Mode = 'DARK';
