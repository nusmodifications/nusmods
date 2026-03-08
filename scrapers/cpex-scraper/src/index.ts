import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';

const ACADEMIC_YEAR = '2025/26';

// Sanity check to see if there are at least this many modules before overwriting cpexModules.json
// The last time I ran this fully there were 3418 modules
const threshold = 1500;

type Env = {
  acadApiKey: string;
  acadAppKey: string;
  baseUrl: string;
  courseApiKey: string;
};

type V1ApiResponse<T> = {
  code: string;
  data: T;
  msg: string;
};

type AcademicGrp = {
  AcademicGroup: string;
  Description: string;
  DescriptionShort: string;
  EffectiveDate: string;
  EffectiveStatus: string;
};

// Set everything to optional because we cannot trust the API to be consistent
type Module = {
  CatalogNumber?: string;
  CourseAttributes?: Array<{
    Code: string;
    Value: string;
  }>;
  SubjectArea?: string;
  Title?: string;
  UnitsMin?: number | null;
};

type FetchError = {
  message?: string;
  response?: {
    status?: number;
  };
};

export type CPExModule = {
  inS1CPEx?: boolean;
  inS2CPEx?: boolean;
  moduleCode: string;
  moduleCredit: string;
  title: string;
};

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

const envPath = path.join(__dirname, '../../env.json');
const env = JSON.parse(fs.readFileSync(envPath, 'utf8')) as Env;
const baseUrl = env.baseUrl.endsWith('/') ? env.baseUrl : `${env.baseUrl}/`;

const FETCH_OK = '00000';

const MAX_ITEMS = 1000;

// Authentication headers matching the new NUS API
const acadHeaders = {
  'Content-Type': 'application/json',
  'X-API-KEY': env.acadApiKey,
  'X-APP-KEY': env.acadAppKey,
};

const courseHeaders = {
  'Content-Type': 'application/json',
  'X-API-KEY': env.courseApiKey,
};

function getTimestampForFilename(): string {
  const date = new Date();

  return (
    date.getFullYear().toString() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds())
  );
}

// --- Normalization helpers (mirrors nus-v2 cleanString / sanitizeModuleInfo) ---

/** Strip HTML tags, decode common HTML entities, remove NBSPs, collapse whitespace. */
function cleanString(s: string): string {
  return s
    .replace(/<[^>]*>?/gm, ' ') // strip HTML tags
    .replace(/&nbsp;/gi, ' ') // decode &nbsp;
    .replace(/&amp;/gi, '&') // decode &amp;
    .replace(/&lt;/gi, '<') // decode &lt;
    .replace(/&gt;/gi, '>') // decode &gt;
    .replace(/&quot;/gi, '"') // decode &quot;
    .replace(/&#39;/gi, "'") // decode &#39;
    .replace(/\u00A0/g, ' ') // replace NBSP unicode char
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

/** Normalize a module code: clean HTML/entities, strip ALL whitespace, uppercase. */
function normalizeModuleCode(subject: string, catalogNbr: string): string {
  const raw = cleanString(subject) + cleanString(catalogNbr);
  return raw.replace(/\s/g, '').toUpperCase();
}

/** Normalize title: collapse whitespace, trim. */
function normalizeTitle(s: string): string {
  return cleanString(s);
}

/** Normalize credit: trim whitespace. */
function normalizeCredit(n: number | null): string {
  return n === null ? '0' : String(n).trim();
}

// MPE attribute value → semester flag mapping (supports both old and new API formats)
const mpeValueMap: Record<string, { inS1CPEx?: boolean; inS2CPEx?: boolean }> = {
  S1: { inS1CPEx: true },
  'S1 - Sem 1': { inS1CPEx: true },
  'S1&S2': { inS1CPEx: true, inS2CPEx: true },
  'S1&S2 - Sem 1 & 2': { inS1CPEx: true, inS2CPEx: true },
  S2: { inS2CPEx: true },
  'S2 - Sem 2': { inS2CPEx: true },
};

async function scraper() {
  // Fetch faculties (academic groups) using the new edurec endpoint
  const getFacultiesResponse = await axios.get<V1ApiResponse<Array<AcademicGrp>>>(
    `${baseUrl}edurec/config/v1/get-acadgroup`,
    { headers: acadHeaders },
  );

  if (getFacultiesResponse.data.code !== FETCH_OK) {
    throw new Error(`Failed to fetch faculties: ${getFacultiesResponse.data.msg}`);
  }

  const facultiesData = getFacultiesResponse.data.data;

  // Ensure faculty 099 (Non-Faculty-based Departments) is included, as it may
  // be missing from the API response but is needed for modules like CS2101.
  if (!facultiesData.some((faculty) => faculty.AcademicGroup === '099')) {
    facultiesData.push({
      AcademicGroup: '099',
      Description: 'Non-Faculty-based Departments',
      DescriptionShort: 'Non-Faculty-based Departments',
      EffectiveDate: '1905-01-01',
      EffectiveStatus: 'A',
    });
  }

  console.log(`Total faculties: ${facultiesData.length}`);

  const collatedCPExModulesMap = new Map<string, CPExModule>();

  // Summary counters
  let totalRawRows = 0;
  let skippedIncomplete = 0;
  let duplicatesMerged = 0;
  const unknownMpeValues = new Set<string>();

  for (let i = 0; i < facultiesData.length; i++) {
    const faculty = facultiesData[i];

    // Skip inactive faculties (mirrors old eff_status: 'A' filter)
    if (faculty.EffectiveStatus !== 'A') {
      continue;
    }

    // CourseNUSMods API expects the first 3 characters of the AcademicGroup code
    const acadGroupCode =
      faculty.AcademicGroup.length >= 3 ? faculty.AcademicGroup.slice(0, 3) : faculty.AcademicGroup;

    console.log(
      `[${i + 1}/${facultiesData.length}] Fetching modules for ${faculty.Description} (${acadGroupCode})...`,
    );

    // Fetch modules with pagination
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      let modules: Array<Module>;
      try {
        const getModulesResponse = await axios.get<{ data: Array<Module>; itemCount: number }>(
          `${baseUrl}CourseNUSMods`,
          {
            headers: courseHeaders,
            params: {
              acadGroupCode,
              applicableInYear: ACADEMIC_YEAR,
              latestVersionOnly: 'True',
              maxItems: String(MAX_ITEMS),
              offset: String(offset),
            },
          },
        );

        modules = getModulesResponse.data.data;
      } catch (error: unknown) {
        const err = error as FetchError;
        // The modules endpoint may return 404 for faculties with no modules
        if (err.response?.status === 404) {
          console.log(`  No modules found for ${faculty.Description} (404)`);
          break;
        }
        console.log(
          `  Error fetching modules for ${faculty.Description} (${acadGroupCode}): ${err.message}`,
        );
        break;
      }

      for (const module of modules) {
        totalRawRows++;

        if (
          !module.Title ||
          module.UnitsMin == null ||
          !module.SubjectArea ||
          !module.CatalogNumber ||
          !module.CourseAttributes
        ) {
          skippedIncomplete++;
          continue;
        }

        const moduleCode = normalizeModuleCode(module.SubjectArea, module.CatalogNumber);
        const moduleTitle = normalizeTitle(module.Title);
        const moduleCredit = normalizeCredit(module.UnitsMin);

        const cpexAttribute = module.CourseAttributes.find(
          (attribute) => attribute.Code.trim() === 'MPE',
        );

        if (!cpexAttribute) {
          continue;
        }

        const value = cpexAttribute.Value.trim();
        const semesterFlags = mpeValueMap[value];

        if (!semesterFlags) {
          if (!unknownMpeValues.has(value)) {
            console.log(`Unknown CPEx attribute value: '${value}' (first seen at ${moduleCode})`);
            unknownMpeValues.add(value);
          }
          continue;
        }

        // Merge duplicates with OR semantics for semester flags
        const existing = collatedCPExModulesMap.get(moduleCode);
        if (existing) {
          duplicatesMerged++;

          // Warn on conflicting title or credit
          if (existing.title !== moduleTitle) {
            console.log(
              `  Warning: conflicting title for ${moduleCode}: '${existing.title}' vs '${moduleTitle}'`,
            );
          }
          if (existing.moduleCredit !== moduleCredit) {
            console.log(
              `  Warning: conflicting credit for ${moduleCode}: '${existing.moduleCredit}' vs '${moduleCredit}'`,
            );
          }

          // Keep first non-empty title/credit, OR semester flags
          existing.title = existing.title || moduleTitle;
          existing.moduleCredit = existing.moduleCredit || moduleCredit;
          existing.inS1CPEx = existing.inS1CPEx || semesterFlags.inS1CPEx;
          existing.inS2CPEx = existing.inS2CPEx || semesterFlags.inS2CPEx;
          continue;
        }

        collatedCPExModulesMap.set(moduleCode, {
          ...semesterFlags,
          moduleCode,
          moduleCredit,
          title: moduleTitle,
        });
      }

      if (modules.length < MAX_ITEMS) {
        hasMore = false;
      } else {
        offset += MAX_ITEMS;
      }
    }
  }

  // Sort by moduleCode for deterministic output (matches nus-v2 CollateModules sortBy)
  const collatedCPExModules = Array.from(collatedCPExModulesMap.values()).sort((a, b) =>
    a.moduleCode.localeCompare(b.moduleCode),
  );

  // Summary
  console.log(`\n--- Scrape Summary ---`);
  console.log(`Total raw rows:          ${totalRawRows}`);
  console.log(`Skipped (incomplete):    ${skippedIncomplete}`);
  console.log(`Unknown MPE values:      ${unknownMpeValues.size}`);
  console.log(`Duplicate codes merged:  ${duplicatesMerged}`);
  console.log(`Final module count:      ${collatedCPExModules.length}`);

  const DATA_DIR = path.join(__dirname, '../../data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  const OLD_DATA_DIR = path.join(DATA_DIR, '/old');
  if (!fs.existsSync(OLD_DATA_DIR)) {
    fs.mkdirSync(OLD_DATA_DIR);
  }

  if (collatedCPExModules.length >= threshold) {
    fs.writeFileSync(path.join(DATA_DIR, 'cpexModules.json'), JSON.stringify(collatedCPExModules));
    console.log(`Wrote ${collatedCPExModules.length} modules to cpexModules.json.`);
  } else {
    console.log(
      `Not writing to cpexModules.json because the number of modules ${collatedCPExModules.length} is less than the threshold of ${threshold}.`,
    );
  }

  const archiveFilename = `cpexModules-${getTimestampForFilename()}.json`;
  fs.writeFileSync(path.join(OLD_DATA_DIR, archiveFilename), JSON.stringify(collatedCPExModules));
  console.log(`Wrote ${collatedCPExModules.length} modules to archive ${archiveFilename}.`);
  console.log('Done!');
}

scraper().catch((error) => {
  console.error(`Failed to scrape: ${error}`);
});
