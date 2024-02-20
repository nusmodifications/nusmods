export type ThemeId = string;

export type Theme = {
  readonly id: ThemeId;
  readonly name: string;
  readonly numOfColors: number;
};

export type Mode = 'LIGHT' | 'DARK';
export const LIGHT_MODE: Mode = 'LIGHT';
export const DARK_MODE: Mode = 'DARK';
