import { readFile } from 'node:fs/promises';

type FontDefinition = {
  data: Buffer;
  name: string;
  style: 'normal';
  weight: 400 | 600 | 700;
};

let fontsPromise: Promise<FontDefinition[]> | null = null;

async function loadFonts(): Promise<FontDefinition[]> {
  const [regular, semibold, bold] = await Promise.all([
    readFile(require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff')),
    readFile(require.resolve('@fontsource/inter/files/inter-latin-600-normal.woff')),
    readFile(require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff')),
  ]);

  return [
    {
      data: regular,
      name: 'Inter',
      style: 'normal',
      weight: 400,
    },
    {
      data: semibold,
      name: 'Inter',
      style: 'normal',
      weight: 600,
    },
    {
      data: bold,
      name: 'Inter',
      style: 'normal',
      weight: 700,
    },
  ];
}

export async function getSatoriFonts() {
  if (!fontsPromise) {
    fontsPromise = loadFonts();
  }

  return fontsPromise;
}
