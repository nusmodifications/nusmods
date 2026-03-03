import axios from 'axios';
import fs from 'fs';
import path from 'path';

import env from '../env.json';

const ACADEMIC_YEAR = '2025/26';

// Sanity check to see if there are at least this many modules before overwriting cpexModules.json
// The last time I ran this fully there were 3418 modules
const threshold = 1500;

const baseUrl = env['baseUrl'].endsWith('/') ? env['baseUrl'] : `${env['baseUrl']}/`;

const FETCH_OK = '00000';

const MAX_ITEMS = 1000;

// Authentication headers matching the new NUS API
const acadHeaders = {
  'Content-Type': 'application/json',
  'X-API-KEY': env['acadApiKey'],
  'X-APP-KEY': env['acadAppKey'],
};

const courseHeaders = {
  'Content-Type': 'application/json',
  'X-API-KEY': env['courseApiKey'],
};

function getTimestampForFilename(): string {
  function pad2(n: number): string {
    return n < 10 ? '0' + n : String(n);
  }

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

// Strip HTML tags and normalize whitespace (mirrors nus-v2 stripTags/cleanString)
function stripTags(string: string): string {
  return string
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// V1 API response format (used by edurec endpoints)
type V1ApiResponse<T> = {
  msg: string;
  code: string;
  data: T;
};

type AcademicGrp = {
  EffectiveStatus: string;
  AcademicGroup: string;
  DescriptionShort: string;
  Description: string;
  EffectiveDate: string;
};

// Set everything to optional because we cannot trust the API to be consistent
type Module = {
  Title?: string;
  UnitsMin?: number | null;
  SubjectArea?: string;
  CatalogNumber?: string;
  CourseAttributes?: {
    Code: string;
    Value: string;
  }[];
};

// MPE attribute value → semester flag mapping (supports both old and new API formats)
const mpeValueMap: Record<string, { inS1CPEx?: boolean; inS2CPEx?: boolean }> = {
  'S1 - Sem 1': { inS1CPEx: true },
  'S2 - Sem 2': { inS2CPEx: true },
  'S1&S2 - Sem 1 & 2': { inS1CPEx: true, inS2CPEx: true },
  'S1': { inS1CPEx: true },
  'S2': { inS2CPEx: true },
  'S1&S2': { inS1CPEx: true, inS2CPEx: true },
};

export type CPExModule = {
  title: string;
  moduleCode: string;
  moduleCredit: string;
  inS1CPEx?: boolean;
  inS2CPEx?: boolean;
};

async function scraper() {
  // Fetch faculties (academic groups) using the new edurec endpoint
  const getFacultiesResponse = await axios.get<V1ApiResponse<AcademicGrp[]>>(
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
      DescriptionShort: 'Non-Faculty-based Departments',
      Description: 'Non-Faculty-based Departments',
      EffectiveStatus: 'A',
      EffectiveDate: '1905-01-01',
    });
  }

  console.log(`Total faculties: ${facultiesData.length}`);

  const collatedCPExModulesMap = new Map<string, CPExModule>();

  for (let i = 0; i < facultiesData.length; i++) {
    const faculty = facultiesData[i];

    // Skip inactive faculties (mirrors old eff_status: 'A' filter)
    if (faculty.EffectiveStatus !== 'A') {
      continue;
    }

    // CourseNUSMods API expects the first 3 characters of the AcademicGroup code
    const acadGroupCode =
      faculty.AcademicGroup.length >= 3
        ? faculty.AcademicGroup.slice(0, 3)
        : faculty.AcademicGroup;

    console.log(
      `[${i + 1}/${facultiesData.length}] Fetching modules for ${faculty.Description} (${acadGroupCode})...`,
    );

    // Fetch modules with pagination
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      let modules: Module[];
      try {
        const getModulesResponse = await axios.get<{ data: Module[]; itemCount: number }>(
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
      } catch (e: unknown) {
        const err = e as { response?: { status?: number }; message?: string };
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
        if (
          !module.Title ||
          module.UnitsMin == null ||
          !module.SubjectArea ||
          !module.CatalogNumber ||
          !module.CourseAttributes
        ) {
          continue;
        }

        const moduleTitle = stripTags(module.Title);
        const moduleCode = `${stripTags(module.SubjectArea)}${stripTags(module.CatalogNumber)}`;

        // Filter duplicate modules
        if (collatedCPExModulesMap.has(moduleCode)) {
          continue;
        }

        const moduleCredit = module.UnitsMin === null ? '0' : String(module.UnitsMin);
        const cpexAttribute = module.CourseAttributes.find(
          (attribute) => attribute.Code.trim() === 'MPE',
        );

        if (!cpexAttribute) {
          continue;
        }

        const value = cpexAttribute.Value.trim();
        const semesterFlags = mpeValueMap[value];

        if (!semesterFlags) {
          console.log(`Unknown CPEx attribute value: ${value} for ${moduleCode} ${moduleTitle}`);
          continue;
        }

        const cpexModuleToAdd: CPExModule = {
          title: moduleTitle,
          moduleCode,
          moduleCredit,
          ...semesterFlags,
        };

        collatedCPExModulesMap.set(moduleCode, cpexModuleToAdd);
      }

      if (modules.length < MAX_ITEMS) {
        hasMore = false;
      } else {
        offset += MAX_ITEMS;
      }
    }
  }

  const collatedCPExModules = Array.from(collatedCPExModulesMap.values());
  console.log(`Collated ${collatedCPExModules.length} modules.`);

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
