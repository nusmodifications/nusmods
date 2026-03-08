import fs from 'node:fs';
import path from 'node:path';

import { scrapeCPEx, type ScraperEnv } from './scraper';

const ACADEMIC_YEAR = '2025/26';

// Sanity check to see if there are at least this many modules before overwriting cpexModules.json
// The last time I ran this fully there were 3418 modules
const threshold = 1500;

const envPath = path.join(__dirname, '../../env.json');
const env = JSON.parse(fs.readFileSync(envPath, 'utf8')) as ScraperEnv;

scrapeCPEx({
  academicYear: ACADEMIC_YEAR,
  env,
  threshold,
}).catch((error) => {
  console.error(`Failed to scrape: ${error}`);
});
