import type { Page } from 'puppeteer-core';
import type { ExportData } from '@nusmods/types';

export type { ExportData } from '@nusmods/types';

export interface State {
  data: ExportData;
  page: Page;
}
