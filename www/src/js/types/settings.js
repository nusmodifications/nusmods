// @flow
export type ThemeId = string;

export type Theme = {|
  +id: ThemeId,
  +name: string,
|};

export type Mode = 'LIGHT' | 'DARK' | 'OS';
export const LIGHT_MODE: Mode = 'LIGHT';
export const DARK_MODE: Mode = 'DARK';
export const OS_MODE: Mode = 'OS';
