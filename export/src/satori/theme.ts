import type { ColorScheme } from '../types';

type ThemeColors = {
  background: string;
  border: string;
  bodyColor: string;
  dayLabelBackground: string;
  gray: string;
  grayLight: string;
  grayLighter: string;
  grayLightest: string;
  mutedText: string;
  text: string;
};

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`;
}

export function darken(hex: string, percent: number): string {
  const [r, g, b] = parseHex(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newL = Math.max(0, l - percent / 100);
  const [nr, ng, nb] = hslToRgb(h, s, newL);
  return toHex(nr, ng, nb);
}

const TIMETABLE_THEME_COLORS: Record<string, string[]> = {
  ashes: ['#c7ae95', '#c7c795', '#aec795', '#95c7ae', '#95aec7', '#ae95c7', '#c795ae', '#c79595'],
  chalk: ['#fb9fb1', '#eda987', '#ddb26f', '#acc267', '#12cfc0', '#6fc2ef', '#e1a3ee', '#deaf8f'],
  eighties: [
    '#f2777a',
    '#f99157',
    '#ffcc66',
    '#99cc99',
    '#66cccc',
    '#6699cc',
    '#cc99cc',
    '#d27b53',
  ],
  google: ['#cc342b', '#f96a38', '#fba922', '#198844', '#3971ed', '#79a4f9', '#a36ac7', '#ec9998'],
  mocha: ['#cb6077', '#d28b71', '#f4bc87', '#beb55b', '#7bbda4', '#8ab3b5', '#a89bb9', '#bb9584'],
  monokai: ['#f92672', '#fd971f', '#f4bf75', '#a6e22e', '#a1efe4', '#66d9ef', '#ae81ff', '#cc6633'],
  ocean: ['#bf616a', '#d08770', '#ebcb8b', '#a3be8c', '#96b5b4', '#8fa1b3', '#b48ead', '#ab7967'],
  'oceanic-next': [
    '#ec5f67',
    '#f99157',
    '#fac863',
    '#99c794',
    '#5fb3b3',
    '#6699cc',
    '#c594c5',
    '#ab7967',
  ],
  paraiso: ['#ef6155', '#f99b15', '#fec418', '#48b685', '#5bc4bf', '#06b6ef', '#815ba4', '#e96ba8'],
  railscasts: [
    '#da4939',
    '#cc7833',
    '#ffc66d',
    '#a5c261',
    '#519f50',
    '#6d9cbe',
    '#b6b3eb',
    '#bc9458',
  ],
  tomorrow: [
    '#cc6666',
    '#de935f',
    '#f0c674',
    '#b5bd68',
    '#8abeb7',
    '#81a2be',
    '#b294bb',
    '#a3685a',
  ],
  twilight: [
    '#cf6a4c',
    '#cda869',
    '#f9ee98',
    '#8f9d6a',
    '#afc4db',
    '#7587a6',
    '#9b859d',
    '#9b703f',
  ],
};

const LIGHT_THEME: ThemeColors = {
  background: '#ffffff',
  bodyColor: '#69707a',
  border: '#d3d6db',
  dayLabelBackground: '#ffffff',
  gray: '#69707a',
  grayLight: '#aeb1b5',
  grayLighter: '#d3d6db',
  grayLightest: '#f3f5f8',
  mutedText: '#aeb1b5',
  text: '#69707a',
};

const DARK_THEME: ThemeColors = {
  background: '#222324',
  bodyColor: '#aaaaaa',
  border: '#474747',
  dayLabelBackground: '#222324',
  gray: '#aaaaaa',
  grayLight: '#666666',
  grayLighter: '#474747',
  grayLightest: '#292929',
  mutedText: '#666666',
  text: '#aaaaaa',
};

export function getLessonPalette(themeId: string): string[] {
  return TIMETABLE_THEME_COLORS[themeId] ?? TIMETABLE_THEME_COLORS.eighties;
}

export function getSurfaceColors(colorScheme: ColorScheme): ThemeColors {
  return colorScheme === 'DARK_COLOR_SCHEME' ? DARK_THEME : LIGHT_THEME;
}
